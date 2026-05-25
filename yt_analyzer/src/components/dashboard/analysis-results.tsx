'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode, type SVGProps } from 'react';

import type { AnalyzedVideo, ChannelAnalysis, VideoTranscriptAnalysis } from '@/lib/types/analysis';
import { StatusPill } from '@/components/ui/status-pill';
import { clamp, formatCompactNumber, formatDecimal, safeRatio } from '@/lib/utils';

interface AnalysisResultsProps {
  analysis: ChannelAnalysis;
  onAnalyzeTranscript: (analysisId: string, videoId: string) => Promise<void>;
}

function formatWholeNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en').format(value);
}

function formatPublishedLabel(video: AnalyzedVideo) {
  if (video.publishedText) return video.publishedText;
  if (!video.publishedAt) return 'Publish date unavailable';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(video.publishedAt));
}

function formatPercentPrecise(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

function formatDurationLabel(durationSeconds: number | null | undefined) {
  if (durationSeconds == null || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return '—';

  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function computeEngagementRate(video: AnalyzedVideo) {
  return safeRatio(video.likeCount, video.viewCount);
}

function computeMedianEngagementRate(analysis: ChannelAnalysis) {
  if (analysis.medianEngagementPer1kViews == null) return null;
  return analysis.medianEngagementPer1kViews / 1000;
}

function sortVideosNewestFirst(videos: AnalyzedVideo[]) {
  return [...videos]
    .map((video, index) => ({ video, index }))
    .sort((left, right) => {
      const leftTime = left.video.publishedAt ? new Date(left.video.publishedAt).getTime() : null;
      const rightTime = right.video.publishedAt ? new Date(right.video.publishedAt).getTime() : null;

      if (leftTime != null && rightTime != null && leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      if (leftTime != null && rightTime == null) return -1;
      if (leftTime == null && rightTime != null) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.video);
}

function getOutlierBadgeStyle(ratio: number | null): CSSProperties | undefined {
  if (ratio == null) return undefined;

  const intensity = clamp((ratio - 1) / 6, 0, 1);
  const bgMix = Math.round(intensity * 72);
  const borderMix = Math.round(intensity * 78);
  const textMix = Math.round(intensity * 100);

  return {
    backgroundColor: `color-mix(in oklab, var(--color-rose-500) ${bgMix}%, var(--color-zinc-950))`,
    borderColor: `color-mix(in oklab, var(--color-rose-400) ${borderMix}%, var(--color-zinc-700))`,
    color: `color-mix(in oklab, var(--color-rose-100) ${textMix}%, var(--color-zinc-200))`,
  };
}

function getEngagementBadgeStyle(rate: number | null, medianRate: number | null): CSSProperties | undefined {
  if (rate == null || medianRate == null || medianRate <= 0) return undefined;

  const ratio = rate / medianRate;
  const intensity = clamp((ratio - 1) / 1.5, 0, 1);
  const bgMix = Math.round(intensity * 68);
  const borderMix = Math.round(intensity * 76);
  const textMix = Math.round(intensity * 100);

  return {
    backgroundColor: `color-mix(in oklab, var(--color-emerald-500) ${bgMix}%, var(--color-zinc-950))`,
    borderColor: `color-mix(in oklab, var(--color-emerald-400) ${borderMix}%, var(--color-zinc-700))`,
    color: `color-mix(in oklab, var(--color-emerald-100) ${textMix}%, var(--color-zinc-200))`,
  };
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M2.46 12C3.73 7.94 7.53 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.07 7-9.54 7S3.73 16.06 2.46 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path
        d="m6 15 4-4 3 2 5-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M16 7h2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function HeartPulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M20.42 4.58a5.4 5.4 0 0 0-7.64 0L12 5.36l-.78-.78a5.4 5.4 0 0 0-7.64 7.64L12 20.64l8.42-8.42a5.4 5.4 0 0 0 0-7.64Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M7 12h2.2l1.3-2.2 2.2 4.4 1.4-2.2H17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HelpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.75 9.25a2.6 2.6 0 1 1 4.47 1.8c-.8.8-1.47 1.22-1.47 2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="16.8" r="1" fill="currentColor" />
    </svg>
  );
}

function MetricBadge({
  label,
  value,
  icon,
  style,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-200"
      style={style}
      title={`${label}: ${value}`}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center text-current">{icon}</span>
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function DetailMetric({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string;
  tone?: CSSProperties;
  helper?: string;
}) {
  const isHighlighted = Boolean(tone);

  return (
    <div className="min-h-[4rem] rounded-xl border border-white/10 bg-zinc-950/75 px-3.5 py-3.5" style={tone}>
      <div className="space-y-1.5">
        <p className={`text-[10px] uppercase tracking-[0.18em] ${isHighlighted ? 'text-white/70' : 'text-zinc-500'}`}>
          {label}
        </p>
        {helper ? (
          <p className={`text-sm font-medium ${isHighlighted ? 'text-white/90' : 'text-zinc-300/90'}`}>{helper}</p>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function ScoreHelpPopover({ analysis }: { analysis: ChannelAnalysis }) {
  const medianEngagementRate = computeMedianEngagementRate(analysis);

  return (
    <details className="group/help relative">
      <summary className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:border-white/20 hover:text-white">
        <HelpIcon className="h-3.5 w-3.5" />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 text-xs leading-5 text-zinc-300 shadow-2xl backdrop-blur">
        <p className="font-medium text-white">How the scores work</p>
        <ul className="mt-2 space-y-2">
          <li>
            <span className="font-medium text-zinc-100">OS</span> compares the video view count against the channel median views.
          </li>
          <li>
            <span className="font-medium text-zinc-100">Engagement rate</span> is likes divided by views, shown as a percentage.
          </li>
          <li>
            Card badges show views, outlier score, and engagement rate.
          </li>
          <li>
            Channel median engagement: <span className="font-medium text-zinc-100">{formatPercentPrecise(medianEngagementRate)}</span>
          </li>
        </ul>
      </div>
    </details>
  );
}

function transcriptBadge(video: AnalyzedVideo) {
  if (video.transcriptAnalysis) {
    return <StatusPill label="analyzed" tone="success" />;
  }

  return null;
}

function transcriptActionLabel(video: AnalyzedVideo) {
  if (video.transcriptAnalysis) {
    return 'Re-run AI transcript analysis';
  }

  if (video.transcriptStatus === 'unavailable') {
    return 'Retry AI transcript analysis';
  }

  return 'Analyze transcript with AI';
}

function transcriptStatusText(video: AnalyzedVideo) {
  if (video.transcriptAnalysis) {
    return `AI transcript analysis saved to this snapshot using ${video.transcriptAnalysis.model}.`;
  }

  if (video.transcriptStatus === 'unavailable') {
    return 'No transcript was available for this video the last time it was checked.';
  }

  return 'Fetch the transcript on demand and run an AI analysis covering value, pacing, credibility, friction, and packaging alignment.';
}

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

function TranscriptAnalysisPanel({ analysis }: { analysis: VideoTranscriptAnalysis }) {
  const d = analysis.dimensions;

  return (
    <div className="mt-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-sky-100/70">AI transcript analysis</p>
          <p className="mt-2 text-sm leading-6 text-zinc-200">{analysis.overview.summary}</p>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <p>{analysis.model}</p>
          <p className="mt-1">{analysis.transcriptExcerpted ? `Excerpted ${analysis.transcriptCharactersSent.toLocaleString()} / ${analysis.transcriptCharacters.toLocaleString()} chars` : `${analysis.transcriptCharacters.toLocaleString()} chars analyzed`}</p>
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

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Value and audience</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.valuePropositionClarity} title="Value proposition clarity" />
            <TranscriptDimensionCard dimension={d.audienceTargeting} title="Audience targeting / level" />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Structure and payoff</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.timeToValue} title="Time to value" />
            <TranscriptDimensionCard dimension={d.openLoopsRetentionStructure} title="Open loops / retention structure" />
            <TranscriptDimensionCard dimension={d.payoffDelivery} title="Payoff delivery" />
            <TranscriptDimensionCard dimension={d.pacing} title="Pacing" />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Engagement, utility, and trust</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-3">
            <TranscriptDimensionCard dimension={d.humorSurpriseTensionConflict} title="Humor / surprise / tension / conflict" />
            <TranscriptDimensionCard dimension={d.practicalUtilityDepth} title="Practical utility depth" />
            <TranscriptDimensionCard dimension={d.credibilityQuality} title="Credibility quality" />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Friction signals</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.filler} invert title="Filler" />
            <TranscriptDimensionCard dimension={d.repetition} invert title="Repetition" />
            <TranscriptDimensionCard dimension={d.sponsorIntrusion} invert title="Sponsor intrusion" />
            <TranscriptDimensionCard dimension={d.ctaOverload} invert title="CTA overload" />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Packaging alignment</p>
          <div className="mt-2 grid gap-3 xl:grid-cols-2">
            <TranscriptDimensionCard dimension={d.titlePromiseVsTranscriptDelivery} title="Title promise vs transcript delivery" />
            <TranscriptDimensionCard dimension={d.thumbnailTitleComplementarity} title="Thumbnail/title complementarity" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisVideoCard({
  analysis,
  video,
  busy,
  error,
  onAnalyzeTranscript,
}: {
  analysis: ChannelAnalysis;
  video: AnalyzedVideo;
  busy: boolean;
  error?: string;
  onAnalyzeTranscript: (videoId: string) => Promise<void>;
}) {
  const engagementRate = computeEngagementRate(video);
  const medianEngagementRate = computeMedianEngagementRate(analysis);

  return (
    <details className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] open:border-white/15 open:bg-zinc-900">
      <summary className="list-none cursor-pointer">
        <div className="relative aspect-video bg-zinc-950">
          {video.thumbnailUrl ? (
            <img alt={video.title} className="h-full w-full object-cover" src={video.thumbnailUrl} />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-950 text-sm text-zinc-500">Thumbnail unavailable</div>
          )}

          {video.durationSeconds != null ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
              {formatDurationLabel(video.durationSeconds)}
            </span>
          ) : null}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold leading-6 text-white">{video.title}</p>
              <p className="mt-2 text-sm text-zinc-400">{formatPublishedLabel(video)}</p>
            </div>
            {transcriptBadge(video)}
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricBadge icon={<EyeIcon className="h-3.5 w-3.5" />} label="Views" value={formatCompactNumber(video.viewCount)} />
            <MetricBadge
              icon={<ChartIcon className="h-3.5 w-3.5" />}
              label="Outlier score"
              style={getOutlierBadgeStyle(video.viewOutlierRatio)}
              value={video.viewOutlierRatio != null ? `${formatDecimal(video.viewOutlierRatio)}x` : '—'}
            />
            <MetricBadge
              icon={<HeartPulseIcon className="h-3.5 w-3.5" />}
              label="Engagement rate"
              style={getEngagementBadgeStyle(engagementRate, medianEngagementRate)}
              value={formatPercentPrecise(engagementRate)}
            />
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Click to open details</p>
        </div>
      </summary>

      <div className="border-t border-white/10 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Score details</p>
          <ScoreHelpPopover analysis={analysis} />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <DetailMetric
            label="Outlier score"
            tone={getOutlierBadgeStyle(video.viewOutlierRatio)}
            value={video.viewOutlierRatio != null ? `${formatDecimal(video.viewOutlierRatio, 2)}x` : '—'}
          />
          <DetailMetric
            label="Engagement rate"
            tone={getEngagementBadgeStyle(engagementRate, medianEngagementRate)}
            value={formatPercentPrecise(engagementRate)}
          />
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <DetailMetric label="Views" value={formatWholeNumber(video.viewCount)} />
          <DetailMetric label="Likes" value={formatWholeNumber(video.likeCount)} />
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Duration:</span> {formatDurationLabel(video.durationSeconds)}
        </p>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Transcript analysis</p>
              <p className="mt-2 text-sm text-zinc-400">{transcriptStatusText(video)}</p>
            </div>
            <button
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:text-zinc-500"
              disabled={busy}
              onClick={() => {
                void onAnalyzeTranscript(video.id);
              }}
              type="button"
            >
              {busy ? 'Running AI analysis…' : transcriptActionLabel(video)}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>

        {video.whyFlagged.length ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Why it stood out</p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
              {video.whyFlagged.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {video.transcriptAnalysis ? <TranscriptAnalysisPanel analysis={video.transcriptAnalysis} /> : null}

        {video.contextNotes.length ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
            {video.contextNotes.join(' ')}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-sm text-zinc-400">
          <a className="font-medium text-zinc-100 transition hover:text-white" href={video.url} rel="noreferrer" target="_blank">
            Watch on YouTube
          </a>
        </div>
      </div>
    </details>
  );
}

const INITIAL_VISIBLE_VIDEOS = 12;
const LOAD_MORE_STEP = 12;

export function AnalysisResults({ analysis, onAnalyzeTranscript }: AnalysisResultsProps) {
  const videos = useMemo(() => sortVideosNewestFirst(analysis.videos), [analysis.videos]);
  const aiTranscriptAnalysisCount = analysis.videos.filter((video) => Boolean(video.transcriptAnalysis)).length;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_VIDEOS);
  const [activeTranscriptVideoId, setActiveTranscriptVideoId] = useState<string | null>(null);
  const [transcriptErrors, setTranscriptErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_VIDEOS);
    setActiveTranscriptVideoId(null);
    setTranscriptErrors({});
  }, [analysis.id]);

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMoreVideos = visibleCount < videos.length;

  async function handleTranscriptAnalyze(videoId: string) {
    setActiveTranscriptVideoId(videoId);
    setTranscriptErrors((current) => {
      const next = { ...current };
      delete next[videoId];
      return next;
    });

    try {
      await onAnalyzeTranscript(analysis.id, videoId);
    } catch (error) {
      setTranscriptErrors((current) => ({
        ...current,
        [videoId]: error instanceof Error ? error.message : 'Unable to analyze this transcript.',
      }));
    } finally {
      setActiveTranscriptVideoId((current) => (current === videoId ? null : current));
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/85 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="relative h-40 bg-zinc-950 sm:h-52 lg:h-60">
          {analysis.bannerImageUrl ? (
            <img alt={`${analysis.channelTitle} banner`} className="h-full w-full object-cover" src={analysis.bannerImageUrl} />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.08),rgba(9,9,11,0.78)_70%,rgba(9,9,11,0.95))]" />
        </div>

        <div className="relative px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4 sm:-mt-14">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-950 shadow-lg sm:h-24 sm:w-24">
                {analysis.profileImageUrl ? (
                  <img alt={`${analysis.channelTitle} profile`} className="h-full w-full object-cover" src={analysis.profileImageUrl} />
                ) : (
                  <span className="text-2xl font-semibold text-zinc-400">{analysis.channelTitle.slice(0, 1)}</span>
                )}
              </div>

              <div className="pb-1">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Latest analysis</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{analysis.channelTitle}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                  {analysis.channelHandle ? <span>{analysis.channelHandle}</span> : null}
                  {analysis.subscriberCountText ? <span>{analysis.subscriberCountText}</span> : null}
                  {analysis.totalVideoCountText ? <span>{analysis.totalVideoCountText}</span> : null}
                  <span>{analysis.videoSampleSize} recent videos analyzed</span>
                </div>
              </div>
            </div>

          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
            Recent-video snapshot laid out like a channel page: newest first, with outlier and engagement badges on each card. Use Analyze transcript inside any card to add on-demand AI transcript analysis with value, pacing, credibility, friction, and packaging reads.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="text-sm text-zinc-500">Median views</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(analysis.medianViews)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="text-sm text-zinc-500">Median likes / 1k views</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatDecimal(analysis.medianEngagementPer1kViews)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="text-sm text-zinc-500">AI transcript analyses</p>
          <p className="mt-2 text-2xl font-semibold text-white">{aiTranscriptAnalysisCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="text-sm text-zinc-500">Sample size</p>
          <p className="mt-2 text-2xl font-semibold text-white">{analysis.videoSampleSize}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">What seems to be working</p>
          <ul className="mt-4 space-y-3">
            {analysis.findings.map((finding) => (
              <li className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300" key={finding}>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Recent videos</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Chronological grid, newest first</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Showing {visibleVideos.length} of {videos.length} loaded recent videos. Scores use the {analysis.videoSampleSize}-video baseline.
            </p>
          </div>
          <a className="text-sm font-medium text-zinc-300 transition hover:text-white" href={analysis.channelUrl} rel="noreferrer" target="_blank">
            Open channel on YouTube
          </a>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleVideos.map((video) => (
            <AnalysisVideoCard
              analysis={analysis}
              busy={activeTranscriptVideoId === video.id}
              error={transcriptErrors[video.id]}
              key={video.id}
              onAnalyzeTranscript={handleTranscriptAnalyze}
              video={video}
            />
          ))}
        </div>

        {hasMoreVideos ? (
          <div className="mt-6 flex justify-center">
            <button
              className="inline-flex items-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5"
              onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, videos.length))}
              type="button"
            >
              Load more videos
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}
