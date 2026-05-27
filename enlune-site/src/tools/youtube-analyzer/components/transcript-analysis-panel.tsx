'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { VideoTranscriptAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import { StatusPill } from '@/tools/youtube-analyzer/components/status-pill';
import { clamp } from '@/tools/youtube-analyzer/lib/utils';

function formatScore(score: number) {
  return `${score}/5`;
}

function scoreHelper(score: number, invert = false) {
  if (invert) {
    if (score >= 5) return 'very high friction';
    if (score === 4) return 'high friction';
    if (score === 3) return 'moderate friction';
    if (score === 2) return 'low friction';
    return 'very low friction';
  }

  if (score >= 5) return 'very strong';
  if (score === 4) return 'strong';
  if (score === 3) return 'moderate';
  if (score === 2) return 'weak';
  return 'very weak';
}

function analysisTileTone(score: number, invert = false): CSSProperties {
  const intensity = clamp((score - 1) / 4, 0, 1);

  if (invert) {
    return {
      backgroundColor: `color-mix(in oklab, var(--color-rose-500) ${Math.round(intensity * 26)}%, var(--color-zinc-950))`,
      borderColor: `color-mix(in oklab, var(--color-rose-400) ${Math.round(intensity * 38)}%, var(--color-zinc-700))`,
    };
  }

  return {
    backgroundColor: `color-mix(in oklab, var(--color-sky-500) ${Math.round(intensity * 18)}%, var(--color-zinc-950))`,
    borderColor: `color-mix(in oklab, var(--color-sky-300) ${Math.round(intensity * 32)}%, var(--color-zinc-700))`,
  };
}

function ReportSection({ title, children, meta }: { title: string; children: ReactNode; meta?: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-white/10 pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {meta ? <div className="text-sm text-zinc-400">{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}

function SectionList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-[15px] leading-7 text-zinc-200" key={item}>
          {item}
        </p>
      ))}
    </div>
  );
}

function EvidenceQuote({
  item,
}: {
  item: VideoTranscriptAnalysis['dimensions'][keyof VideoTranscriptAnalysis['dimensions']]['evidence'][number];
}) {
  return (
    <li className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {item.timestamp ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{item.timestamp}</span>
        ) : null}
        <p className="text-sm font-medium text-zinc-100">{item.note}</p>
      </div>
      <blockquote className="mt-3 border-l-2 border-white/10 pl-4 text-sm leading-7 text-zinc-200">“{item.snippet}”</blockquote>
    </li>
  );
}

function TranscriptEvidenceList({ evidence }: { evidence: VideoTranscriptAnalysis['dimensions'][keyof VideoTranscriptAnalysis['dimensions']]['evidence'] }) {
  if (!evidence.length) {
    return <p className="text-sm leading-6 text-zinc-500">No specific evidence was returned.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3 text-zinc-300">
        {evidence.map((item, index) => (
          <EvidenceQuote item={item} key={`${item.timestamp ?? 'na'}-${index}-${item.snippet}`} />
        ))}
      </ul>
    </div>
  );
}

function DetailFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <div className="mt-2 text-sm leading-6 text-zinc-200">{value}</div>
    </div>
  );
}

function ReportSubsection({
  title,
  dimension,
  helper,
  invert = false,
}: {
  title: string;
  dimension: VideoTranscriptAnalysis['dimensions'][keyof VideoTranscriptAnalysis['dimensions']];
  helper?: string;
  invert?: boolean;
}) {
  return (
    <article className="space-y-4 rounded-3xl border px-5 py-5" style={analysisTileTone(dimension.score, invert)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white">{title}</h3>
          {helper ? <p className="text-sm leading-6 text-zinc-400">{helper}</p> : null}
        </div>
        <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-sm font-medium text-white">
          {formatScore(dimension.score)}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">{scoreHelper(dimension.score, invert)}</p>
        <p className="text-[15px] leading-7 text-zinc-200">{dimension.verdict}</p>
      </div>

      {'intendedAudience' in dimension ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailFact label="Audience" value={dimension.intendedAudience} />
          <DetailFact label="Audience level" value={dimension.audienceLevel} />
        </div>
      ) : null}

      {'secondsToValue' in dimension ? (
        <DetailFact
          label="Estimated time to value"
          value={dimension.secondsToValue != null ? `${dimension.secondsToValue}s` : 'Unclear from transcript'}
        />
      ) : null}

      {'dominantDrivers' in dimension && dimension.dominantDrivers.length ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Primary engagement drivers</p>
          <div className="flex flex-wrap gap-2">
            {dimension.dominantDrivers.map((driver) => (
              <StatusPill key={driver} label={driver} tone="neutral" />
            ))}
          </div>
        </div>
      ) : null}

      {'visualRead' in dimension ? <DetailFact label="Thumbnail read" value={dimension.visualRead} /> : null}

      <TranscriptEvidenceList evidence={dimension.evidence} />
    </article>
  );
}

export function TranscriptAnalysisPanel({ analysis }: { analysis: VideoTranscriptAnalysis }) {
  const d = analysis.dimensions;

  return (
    <div className="space-y-8 rounded-2xl p-4 sm:p-5">
      <ReportSection
        meta={
          <p>
            {analysis.transcriptExcerpted
              ? `Excerpted ${analysis.transcriptCharactersSent.toLocaleString()} / ${analysis.transcriptCharacters.toLocaleString()} chars`
              : `${analysis.transcriptCharacters.toLocaleString()} chars analyzed`}
          </p>
        }
        title="Summary"
      >
        <div className="space-y-4">
          <p className="text-[15px] leading-8 text-zinc-200">{analysis.overview.summary}</p>
          <div className="flex flex-wrap gap-2">
            <StatusPill label={`Value type: ${analysis.overview.valueType}`} tone="neutral" />
            <StatusPill label={`Audience level: ${analysis.dimensions.audienceTargeting.audienceLevel}`} tone="neutral" />
          </div>
        </div>
      </ReportSection>

      <ReportSection title="Strengths">
        <SectionList items={analysis.strengths} />
      </ReportSection>

      <ReportSection title="Risks">
        <SectionList items={analysis.risks} />
      </ReportSection>

      <ReportSection title="Recommendations">
        <SectionList items={analysis.recommendations} />
      </ReportSection>

      <ReportSection title="Value and audience">
        <div className="space-y-4">
          <ReportSubsection dimension={d.valuePropositionClarity} title="Value proposition clarity" />
          <ReportSubsection dimension={d.audienceTargeting} title="Audience targeting / level" />
        </div>
      </ReportSection>

      <ReportSection title="Structure and payoff">
        <div className="space-y-4">
          <ReportSubsection dimension={d.timeToValue} title="Time to value" />
          <ReportSubsection dimension={d.openLoopsRetentionStructure} title="Open loops / retention structure" />
          <ReportSubsection dimension={d.payoffDelivery} title="Payoff delivery" />
          <ReportSubsection dimension={d.pacing} title="Pacing" />
        </div>
      </ReportSection>

      <ReportSection title="Engagement, utility, and trust">
        <div className="space-y-4">
          <ReportSubsection dimension={d.humorSurpriseTensionConflict} title="Humor / surprise / tension / conflict" />
          <ReportSubsection dimension={d.practicalUtilityDepth} title="Practical utility depth" />
          <ReportSubsection dimension={d.credibilityQuality} title="Credibility quality" />
        </div>
      </ReportSection>

      <ReportSection title="Friction signals">
        <div className="space-y-4">
          <ReportSubsection dimension={d.filler} invert title="Filler" />
          <ReportSubsection dimension={d.repetition} invert title="Repetition" />
          <ReportSubsection dimension={d.sponsorIntrusion} invert title="Sponsor intrusion" />
          <ReportSubsection dimension={d.ctaOverload} invert title="CTA overload" />
        </div>
      </ReportSection>

      <ReportSection title="Packaging alignment">
        <div className="space-y-4">
          <ReportSubsection dimension={d.titlePromiseVsTranscriptDelivery} title="Title promise vs transcript delivery" />
          <ReportSubsection dimension={d.thumbnailTitleComplementarity} title="Thumbnail/title complementarity" />
        </div>
      </ReportSection>
    </div>
  );
}
