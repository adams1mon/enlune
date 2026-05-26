'use client';

import type { CSSProperties } from 'react';

import type { VideoTranscriptAnalysis } from '@/lib/types/analysis';
import { StatusPill } from '@/components/ui/status-pill';
import { clamp } from '@/lib/utils';

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

function TranscriptEvidenceList({ evidence }: { evidence: VideoTranscriptAnalysis['dimensions'][keyof VideoTranscriptAnalysis['dimensions']]['evidence'] }) {
  if (!evidence.length) {
    return <p className="mt-3 text-xs text-zinc-500">No specific evidence was returned.</p>;
  }

  return (
    <ul className="mt-3 space-y-2 text-xs text-zinc-300">
      {evidence.map((item, index) => (
        <li className="rounded-xl border border-white/10 bg-black/20 px-3 py-2" key={`${item.timestamp ?? 'na'}-${index}-${item.snippet}`}>
          <p className="font-medium text-zinc-100">{item.timestamp ? `${item.timestamp} · ` : ''}{item.note}</p>
          <p className="mt-1 text-zinc-400">“{item.snippet}”</p>
        </li>
      ))}
    </ul>
  );
}

function TranscriptDimensionCard({
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
    <div className="rounded-2xl border border-white/10 px-4 py-4" style={analysisTileTone(dimension.score, invert)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{title}</p>
          {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white">
          {formatScore(dimension.score)}
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-200">{scoreHelper(dimension.score, invert)}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{dimension.verdict}</p>

      {'intendedAudience' in dimension ? (
        <div className="mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="uppercase tracking-[0.16em] text-zinc-500">Audience</p>
            <p className="mt-1 text-zinc-100">{dimension.intendedAudience}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="uppercase tracking-[0.16em] text-zinc-500">Level</p>
            <p className="mt-1 text-zinc-100">{dimension.audienceLevel}</p>
          </div>
        </div>
      ) : null}

      {'secondsToValue' in dimension ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
          <p className="uppercase tracking-[0.16em] text-zinc-500">Estimated time to value</p>
          <p className="mt-1 text-zinc-100">{dimension.secondsToValue != null ? `${dimension.secondsToValue}s` : 'Unclear from transcript'}</p>
        </div>
      ) : null}

      {'dominantDrivers' in dimension && dimension.dominantDrivers.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {dimension.dominantDrivers.map((driver) => (
            <StatusPill key={driver} label={driver} tone="neutral" />
          ))}
        </div>
      ) : null}

      {'visualRead' in dimension ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
          <p className="uppercase tracking-[0.16em] text-zinc-500">Thumbnail read</p>
          <p className="mt-1 text-zinc-100">{dimension.visualRead}</p>
        </div>
      ) : null}

      <TranscriptEvidenceList evidence={dimension.evidence} />
    </div>
  );
}

export function TranscriptAnalysisPanel({ analysis }: { analysis: VideoTranscriptAnalysis }) {
  const d = analysis.dimensions;

  return (
    <div className="rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Summary</p>
          <p className="mt-4 text-sm leading-6 text-zinc-200">{analysis.overview.summary}</p>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <p className="mt-1">
            {analysis.transcriptExcerpted
              ? `Excerpted ${analysis.transcriptCharactersSent.toLocaleString()} / ${analysis.transcriptCharacters.toLocaleString()} chars`
              : `${analysis.transcriptCharacters.toLocaleString()} chars analyzed`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatusPill label={`Value type: ${analysis.overview.valueType}`} tone="neutral" />
        <StatusPill label={`Audience level: ${analysis.dimensions.audienceTargeting.audienceLevel}`} tone="neutral" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Strengths</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-200">
            {analysis.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Risks</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-200">
            {analysis.risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Recommendations</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-200">
            {analysis.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Value and audience</p>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.valuePropositionClarity} title="Value proposition clarity" />
            <TranscriptDimensionCard dimension={d.audienceTargeting} title="Audience targeting / level" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Structure and payoff</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.timeToValue} title="Time to value" />
            <TranscriptDimensionCard dimension={d.openLoopsRetentionStructure} title="Open loops / retention structure" />
            <TranscriptDimensionCard dimension={d.payoffDelivery} title="Payoff delivery" />
            <TranscriptDimensionCard dimension={d.pacing} title="Pacing" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Engagement, utility, and trust</p>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <TranscriptDimensionCard dimension={d.humorSurpriseTensionConflict} title="Humor / surprise / tension / conflict" />
            <TranscriptDimensionCard dimension={d.practicalUtilityDepth} title="Practical utility depth" />
            <TranscriptDimensionCard dimension={d.credibilityQuality} title="Credibility quality" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Friction signals</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.filler} invert title="Filler" />
            <TranscriptDimensionCard dimension={d.repetition} invert title="Repetition" />
            <TranscriptDimensionCard dimension={d.sponsorIntrusion} invert title="Sponsor intrusion" />
            <TranscriptDimensionCard dimension={d.ctaOverload} invert title="CTA overload" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-lg uppercase tracking-[0.02em] text-white font-bold">Packaging alignment</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.titlePromiseVsTranscriptDelivery} title="Title promise vs transcript delivery" />
            <TranscriptDimensionCard dimension={d.thumbnailTitleComplementarity} title="Thumbnail/title complementarity" />
          </div>
        </div>
      </div>
    </div>
  );
}
