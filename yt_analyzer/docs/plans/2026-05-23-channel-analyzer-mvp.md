# YouTube Channel Analyzer MVP Implementation Plan

> For Hermes: use a compound-engineering workflow: plan -> parallel plan review -> revise -> delegate implementation -> independent review -> fix loop.

Goal: build a local web app that shows which recent videos materially beat a YouTube channel’s baseline, explains the likely repeatable patterns behind those wins, and suggests a few concrete experiments to test next.

Architecture: single Next.js App Router app in TypeScript with Tailwind for UI, server-side route handlers for analysis and saved data, server-only YouTube ingestion modules, and a file-backed JSON store inside this repo. Transcript analysis is heuristic-first so the MVP works without API keys, and the analysis code is isolated so a real LLM analyzer can replace it later.

Tech stack: Next.js, React, TypeScript, Tailwind CSS, youtubei.js, youtube-caption-extractor, zod, date-fns, lucide-react.

Constraints:
- Do not create, modify, or delete anything outside this folder.
- No automated tests required for this MVP; use lint/build/manual smoke verification instead.
- Keep the UI calm and usable; no flashy “AI demo” styling.
- Save all persisted analysis data under this repo only.
- Prefer clean boundaries over cleverness.

Not in MVP:
- no full channel-history analysis
- no auth or multi-user support
- no external DB
- no background jobs
- no robust support for every YouTube URL form
- no exact causal claims about why a video performed well
- no required LLM/API-key integration
- no separate Shorts analytics engine

---

## Product shape

Primary user flows:
1. Paste a supported channel input -> run analysis -> review outliers, winning patterns, and next experiments.
2. Revisit saved channel analyses.
3. Compare two saved channel analyses after the core analyze/save flow is working.

Supported channel inputs for MVP:
- https://www.youtube.com/channel/UC...
- https://www.youtube.com/@handle
- raw @handle

Deferred inputs:
- /user/... URLs
- /c/... URLs
- inferring a channel from an arbitrary video URL

Result structure for a single analysis:
1. At-a-glance summary
   - videos sampled
   - sample date range if available
   - median views
   - median engagement proxy
   - transcript coverage
   - warnings about missing metadata
   - confidence/data-quality note
2. Top takeaways
   - 3-5 evidence-backed bullets
3. View winners
   - videos that materially beat the channel’s median views
4. Engagement standouts
   - videos that materially beat the channel’s median engagement proxy
5. Winning patterns
   - repeated title/topic/format patterns
   - repeated transcript-backed tendencies when available
6. Video deep dives
   - maximum 5 videos
   - transcript signal scores + evidence notes
7. What to test next
   - 3 concrete channel-specific experiments, or fewer when evidence is weak

MVP feature boundaries:
- Analyze the latest 15 non-Short candidate videos when possible.
- If Shorts cannot be excluded reliably, surface a warning that baselines may be skewed.
- Transcript analysis runs for the union of top 3 by view outlier ratio and top 3 by engagement proxy, capped at 5 videos.
- Transcript fetch is best-effort only.
- Context/environment notes are optional, secondary, and phrased as possible timing/context hooks rather than causes.
- Comparison works on saved channel analyses, not on fresh channel URLs.
- Compare is explicitly secondary and cuttable if the single-channel analysis flow is not polished by the end.

Core metrics and heuristics:
- Views outlier ratio = video views / channel median views.
- Primary engagement proxy = comments per 1k views when comment count is available.
- Like count is secondary enrichment only when available.
- Transcript-signal categories scored low|medium|high with evidence:
  - hook strength
  - specificity/tacticality
  - storytelling
  - authority/credibility
  - promotional/CTA intensity
- Context notes inferred only from parseable dates and obvious title keywords; output as “possible timing factor”.

---

## Handoff-ready file plan

Top-level:
- package.json
- next.config.ts
- tsconfig.json
- postcss.config.mjs
- eslint.config.mjs
- README.md
- data/analyses.json
- docs/plans/2026-05-23-channel-analyzer-mvp.md

App:
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- src/app/api/analyze/route.ts
- src/app/api/compare/route.ts
- src/app/api/saved/route.ts

UI:
- src/components/dashboard/analysis-form.tsx
- src/components/dashboard/compare-form.tsx
- src/components/dashboard/saved-analyses-panel.tsx
- src/components/results/channel-summary.tsx
- src/components/results/outlier-table.tsx
- src/components/results/video-analysis-card.tsx
- src/components/results/channel-compare-view.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/input.tsx
- src/components/ui/status-message.tsx

Shared contracts/types:
- src/lib/contracts/api.ts
- src/lib/contracts/schemas.ts
- src/lib/types/analysis.ts
- src/lib/types/storage.ts
- src/lib/utils.ts

Server-only code:
- src/server/errors.ts
- src/server/store/analysis-store.ts
- src/server/youtube/client.ts
- src/server/youtube/normalize.ts
- src/server/youtube/transcripts.ts
- src/server/analysis/outliers.ts
- src/server/analysis/transcript-signals.ts
- src/server/analysis/context-notes.ts
- src/server/analysis/channel-findings.ts
- src/server/analysis/compare.ts
- src/server/services/analyze-channel.ts
- src/server/services/compare-saved-analyses.ts

Server/client boundary rules:
- src/server/** modules are server-only.
- No fs, youtubei.js, or transcript libraries in client components.
- page.tsx should stay thin and compose dashboard components.
- Client components own fetch/state orchestration.

---

## API contracts

All routes return JSON only.
All route inputs are validated with zod.
All failures return structured error payloads, not raw thrown errors.

Error codes:
- INVALID_INPUT
- CHANNEL_NOT_FOUND
- YOUTUBE_FETCH_FAILED
- TRANSCRIPT_FETCH_FAILED
- STORE_READ_FAILED
- STORE_WRITE_FAILED
- INTERNAL_ERROR

Transcript failure is non-fatal at analysis level.
Compare should fail cleanly if either saved analysis cannot be loaded.

### POST /api/analyze
Request:
- channelInput: string
- save?: boolean (default true)

Success 200:
- { ok: true, data: ChannelAnalysis }

Client error 400 / 404 / 502 / 500:
- { ok: false, error: { code: string, message: string } }

### POST /api/compare
Request:
- leftAnalysisId: string
- rightAnalysisId: string

Success 200:
- { ok: true, data: ChannelCompareResult }

Failure:
- { ok: false, error: { code: string, message: string } }

### GET /api/saved
Success 200:
- { ok: true, data: { analyses: SavedChannelAnalysisSummary[] } }

Failure:
- { ok: false, error: { code: string, message: string } }

---

## Domain model requirements

ChannelVideo:
- id: string
- title: string
- url: string
- thumbnailUrl: string | null
- publishedAt: string | null
- publishedText: string | null
- durationSeconds: number | null
- viewCount: number | null
- likeCount: number | null
- commentCount: number | null
- isShort: boolean | null
- transcriptStatus: "not_requested" | "available" | "unavailable" | "error"

TranscriptSignalScore:
- level: "low" | "medium" | "high"
- evidence: string[]

AnalyzedVideo:
- base video fields
- viewOutlierRatio: number | null
- engagementPer1kViews: number | null
- whyFlagged: string[]
- transcriptSignals?: record of the 5 signal scores
- contextNotes: string[]

ChannelAnalysis:
- id: string
- analysisVersion: string
- channelId: string
- channelTitle: string
- channelUrl: string
- analyzedAt: string
- videoSampleSize: number
- transcriptCoverage: number
- dataQuality: "strong" | "mixed" | "weak"
- medianViews: number | null
- medianEngagementPer1kViews: number | null
- findings: string[]
- experiments: string[]
- warnings: string[]
- viewWinners: AnalyzedVideo[]
- engagementStandouts: AnalyzedVideo[]
- videos: AnalyzedVideo[]

SavedChannelAnalysisSummary:
- id: string
- channelTitle: string
- channelUrl: string
- analyzedAt: string
- videoSampleSize: number
- transcriptCoverage: number
- medianViews: number | null
- topTakeaway: string | null
- dataQuality: "strong" | "mixed" | "weak"

ChannelCompareResult:
- leftAnalysisId: string
- rightAnalysisId: string
- generatedAt: string
- overlapPatterns: string[]
- leftDoesMoreOf: string[]
- rightDoesMoreOf: string[]
- borrowingIdeas: string[]
- warnings: string[]

Saved store requirements:
- include schemaVersion: 1
- analyses stored by id
- single-user local store only
- use null, not 0, for unavailable counts
- persist dates as ISO strings
- writes should be atomic via temp file + rename when practical, otherwise serialized and documented
- initialize defensively if file is missing, empty, or invalid
- saved list sorted newest first

---

## Task 0: Validate YouTube data-source viability

Objective: prove the chosen libraries can fetch minimum viable data before full app implementation.

Files:
- temporary throwaway checks may be created inside this repo and removed before finalizing, or the validation can happen during service scaffolding as long as the findings are reflected in README.

Implementation notes:
- Validate only supported inputs:
  - /channel/UC... URL
  - /@handle URL
  - raw @handle
- Verify retrieval of:
  - channel title
  - canonical channel URL
  - latest video list
  - title/url/thumbnail/view count
  - published text/date where available
  - transcript availability for a small subset
- Record unreliable fields explicitly:
  - like counts
  - comment counts
  - exact published dates
  - transcript coverage
- Establish a cutline before continuing:
  - if supported-input resolution or latest-video retrieval is flaky, narrow the MVP further instead of forcing the full build
  - fallback order: drop raw @handle support -> support only /@handle and /channel/ URLs -> if needed, ship analyze-only before compare
  - if comment counts are mostly unavailable, disable engagement standings and ship a views-first analyzer with clear warnings
  - if Shorts detection is unreliable, keep all recent videos in the sample and show a baseline-skew warning
  - if transcript retrieval is spotty, keep the analysis flow but omit transcript scores on affected videos

Verification:
- One public channel works end-to-end at metadata level.
- README or implementation notes document supported inputs and known data limitations.

---

## Task 1: Scaffold the app

Objective: create the Next.js + Tailwind project skeleton and base app shell.

Files:
- Create framework config files at repo root.
- Create src/app/layout.tsx, src/app/page.tsx, src/app/globals.css.
- Create data/analyses.json with the correct initial store shape.

Implementation notes:
- Use a single-page dashboard layout.
- Analyze is the primary section and fully expanded.
- Compare and Saved are secondary sections.
- Set up a restrained visual system: neutral base, one accent, readable tables, rounded cards, generous spacing.

Verification:
- npm install succeeds.
- npm run lint and npm run build succeed once scaffold and placeholder components exist.

---

## Task 2: Build contracts, types, and persistence

Objective: define typed models and a clean store abstraction.

Files:
- Create src/lib/contracts/api.ts
- Create src/lib/contracts/schemas.ts
- Create src/lib/types/analysis.ts
- Create src/lib/types/storage.ts
- Create src/server/errors.ts
- Create src/server/store/analysis-store.ts
- Create data/analyses.json

Implementation notes:
- Validate route inputs with zod.
- Keep API DTOs and storage shapes explicit.
- Store module API should include:
  - listSavedAnalyses()
  - getSavedAnalysis(id)
  - saveChannelAnalysis(analysis)
- Do not save compare snapshots in MVP.
- Saved panel metadata should include:
  - channel name
  - analyzed time
  - videos sampled
  - median views
  - top takeaway summary

Verification:
- Store initializes safely even if the JSON file is malformed or empty.

---

## Task 3: Implement YouTube ingestion

Objective: fetch channel metadata, recent video metadata, and transcripts for selected videos.

Files:
- Create src/server/youtube/client.ts
- Create src/server/youtube/normalize.ts
- Create src/server/youtube/transcripts.ts

Implementation notes:
- normalize.ts resolves supported inputs to a canonical form.
- client.ts fetches channel metadata and recent videos via youtubei.js.
- Normalize values into predictable numeric or null fields.
- Fallback behavior for unreliable fields must be explicit:
  - missing comment counts -> engagement proxy becomes null and the video can only qualify as a view winner
  - missing like counts -> ignore likes entirely
  - missing exact dates -> preserve publishedText, hide cadence/date-range claims that require structured dates
  - uncertain Shorts detection -> keep the video but add a warning that the baseline may be skewed
- Attempt to identify Shorts and exclude them from the baseline when reliable.
- transcripts.ts fetches captions via youtube-caption-extractor with graceful fallback.
- Transcript fetch timeout/concurrency should stay conservative.

Verification:
- A sample analysis request for a public channel returns normalized metadata without crashing.

---

## Task 4: Implement analytics modules

Objective: turn raw video/channel data into evidence-backed findings.

Files:
- Create src/server/analysis/outliers.ts
- Create src/server/analysis/transcript-signals.ts
- Create src/server/analysis/context-notes.ts
- Create src/server/analysis/channel-findings.ts
- Create src/server/analysis/compare.ts

Implementation notes:
- outliers.ts:
  - compute medians and outlier ratios
  - compute engagement proxy when possible
  - select transcript candidates deterministically
- transcript-signals.ts:
  - score the 5 MVP signal categories
  - every score must include evidence notes or excerpts
  - deterministic, modular, and easy to replace later
- context-notes.ts:
  - add sparse “possible timing factor” notes only when obvious
- channel-findings.ts:
  - synthesize 3-5 findings only when evidence quality supports them
  - synthesize up to 3 concrete experiments tied to evidence
  - if data quality is weak, reduce the number of findings/experiments and make uncertainty explicit
  - summarize recurring title/topic patterns from simple keyword frequency, not heavy NLP
- compare.ts:
  - compare saved analyses across cadence, baseline performance, recurring winning patterns, title tendencies, and transcript-backed tendencies when coverage is adequate

Verification:
- Analysis output is readable, grounded, and ends with actionable experiments.

---

## Task 5: Implement service orchestration

Objective: keep route handlers thin by moving workflow logic into server services.

Files:
- Create src/server/services/analyze-channel.ts
- Create src/server/services/compare-saved-analyses.ts

Implementation notes:
- analyze-channel.ts responsibilities:
  - validate and normalize input
  - fetch channel and recent videos
  - choose transcript candidates
  - run outlier, transcript, context, and finding analysis
  - optionally persist
  - return final ChannelAnalysis
- compare-saved-analyses.ts responsibilities:
  - load two saved analyses
  - compute a compare result
  - return final ChannelCompareResult

Verification:
- Route handlers mostly coordinate request/response mapping and error handling.

---

## Task 6: Build API routes

Objective: expose analysis, compare, and saved-data functionality.

Files:
- Create src/app/api/analyze/route.ts
- Create src/app/api/compare/route.ts
- Create src/app/api/saved/route.ts

Implementation notes:
- Map domain/service errors to the defined error codes.
- Keep success envelopes consistent.
- Make transcript errors non-fatal inside analyze results.

Verification:
- Routes return typed JSON envelopes and understandable errors.

---

## Task 7: Build the MVP UI

Objective: create a clean, usable dashboard.

Files:
- Create src/components/dashboard/analysis-form.tsx
- Create src/components/dashboard/compare-form.tsx
- Create src/components/dashboard/saved-analyses-panel.tsx
- Create src/components/results/channel-summary.tsx
- Create src/components/results/outlier-table.tsx
- Create src/components/results/video-analysis-card.tsx
- Create src/components/results/channel-compare-view.tsx
- Create src/components/ui/button.tsx
- Create src/components/ui/card.tsx
- Create src/components/ui/input.tsx
- Create src/components/ui/status-message.tsx
- Modify src/app/page.tsx
- Modify src/app/globals.css

Implementation notes:
- Analyze is the hero workflow.
- Saved analyses let the user reopen and compare two past runs.
- Compare should use saved analyses selection rather than freeform URLs.
- Display data quality clearly:
  - transcript coverage
  - missing engagement data warnings
  - why flagged explanations
- Keep desktop readability the priority; mobile only needs clean stacking.

Verification:
- Manual browser use feels coherent and intentional.

---

## Task 8: Documentation and smoke verification

Objective: leave the MVP runnable and understandable.

Files:
- Create README.md

Implementation notes:
- README should include:
  - what the MVP does
  - supported inputs
  - how to install and run it
  - where saved analyses live
  - known limitations of unofficial YouTube data and transcript coverage
- Run smoke checks:
  - npm run lint
  - npm run build
- Fix any issues discovered.

Verification:
- A fresh user can follow the README and run the app locally.

---

## Review gates before calling implementation done

Plan gate:
- Stack is weekend-sized.
- No feature depends on API keys.
- All persistence stays within this folder.
- Compare is thin and built on saved analyses.
- The primary output is “what worked and what to test next,” not a pile of scores.

Implementation gate:
- Project builds and lints.
- One public channel can be analyzed end-to-end.
- Saved analyses survive refresh.
- If compare remains in scope after the core flow is polished, two saved analyses can be compared end-to-end.
- Transcript absence degrades gracefully.
- Output includes 3 concrete next experiments when evidence quality allows, otherwise fewer with visible uncertainty.

Manual test checklist for Adam:
1. Run one channel analysis and verify summary + outliers look plausible.
2. Try a channel with sparse captions and confirm the app still works.
3. Refresh the page and confirm the saved analysis remains.
4. Analyze two channels, then compare the two saved analyses.
5. Confirm each flagged video explains why it was flagged.
6. Confirm transcript coverage and missing-data warnings are visible.