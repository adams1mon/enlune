# YouTube-Style Analysis UI Refresh Plan

> For Hermes: keep this file in sync with the session todo list. On resume after compaction, read this file first and continue from the first unchecked item.

Goal
- Update the analysis results UI to better match YouTube’s information hierarchy: channel banner/header on top, chronological video grid below, and cleaner expandable card details.

Problem statement
- The current UI already has the broad YouTube-like structure, but the per-video card metrics/details regressed away from the desired scan pattern.
- The screenshot shows extra detail tiles the user no longer wants (`Likes / 1k views`, `Transcript`) and the collapsed badge row still shows likes-per-1k instead of engagement rate.
- Comment counts are available in the data model but often unavailable from the current youtubei.js fetch path, so comments/1k may need to remain omitted or render as unavailable rather than be treated as reliable.

Scope
- Keep the banner/profile/header layout and newest-first grid.
- Update the collapsed video card badges to show: views, OS, engagement rate.
- Keep the heartbeat icon on the engagement badge.
- Restore green heatmap-style coloring for engagement in both the collapsed badge and expanded detail tile.
- Reduce expanded details to two rows:
  - row 1: outlier score, engagement rate
  - row 2: views, likes
- Keep the details section responsible for showing the full numbers behind the derived metrics without reintroducing formula clutter.

Non-goals
- Reworking the saved analyses panel.
- Changing backend data collection beyond what is needed for the requested UI.
- Treating comment counts as fully reliable when the fetch path often does not provide them.

Tasks
- [x] 1. Inspect current UI code and the provided screenshot to identify the exact regression against the requested layout.
- [x] 2. Update the card badge row to replace likes/1k with engagement rate and restore green comparative tinting.
- [x] 3. Trim the expanded detail grid so only OS + engagement rate remain on the first row and views + likes remain on the second row.
- [x] 4. Make sure the detail tiles show the concrete underlying numbers for OS and engagement rate without verbose formula copy.
- [x] 5. Build and visually verify the refreshed UI.
- [x] 6. Update this plan and the session todo list to reflect completion.

Relevant files
- `src/components/dashboard/analysis-results.tsx`
- potentially `src/lib/utils.ts` only if formatting helpers are needed
- no expected backend changes unless inspection proves a required field is missing

Validation
- `npm run build`
- Manual UI check on a fresh analysis:
  - banner/profile header still renders
  - videos stay newest first
  - collapsed badges show views, OS, engagement rate
  - engagement badge/tile use green heatmap-style comparative tinting
  - expanded details show only OS + engagement rate, then views + likes

Notes
- The background process logs are youtubei.js attachment-run warnings and a SIGTERM-style shutdown (`exit code -15`), not evidence that this UI task itself failed.

Completion notes
- Updated `src/components/dashboard/analysis-results.tsx` only.
- Replaced the collapsed `Likes / 1k views` badge with an `Engagement rate` badge while keeping the heartbeat icon and restoring green comparative tinting.
- Reduced open-card details to two rows: `Outlier score` + `Engagement rate`, then `Views` + `Likes`.
- Added concrete supporting numbers inside the top-row detail tiles (`views • median ...` and `likes on ... views`) without reintroducing formula-heavy copy.
- Verified in-browser on a fresh `@AliAbdaal` analysis that the banner/profile header still renders, cards remain newest-first, the first card shows `Views / OS / Engagement rate`, engagement is green-tinted, and the open details no longer include `Likes / 1k views` or `Transcript` cards.
- `npm run build` passes; the only remaining warnings are existing Next.js `no-img-element` lint warnings for thumbnail/banner/profile images.
