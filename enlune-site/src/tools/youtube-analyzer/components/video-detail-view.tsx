'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { analysisPath, YOUTUBE_ANALYZER_ANALYSES } from '@/tools/youtube-analyzer/lib/paths';
import type { AnalyzedVideo, ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import { StatusPill } from '@/tools/youtube-analyzer/components/status-pill';
import { formatCompactNumber, formatDecimal, safeRatio } from '@/tools/youtube-analyzer/lib/utils';
import { TranscriptAnalysisPanel } from '@/tools/youtube-analyzer/components/transcript-analysis-panel';

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

function transcriptStatusTone(video: AnalyzedVideo): 'neutral' | 'success' | 'warning' {
  if (video.transcriptAnalysis) return 'success';
  if (video.transcriptStatus === 'unavailable') return 'warning';
  return 'neutral';
}

function transcriptStatusLabel(video: AnalyzedVideo) {
  if (video.transcriptAnalysis) {
    return 'Analysis saved';
  }

  if (video.transcriptStatus === 'unavailable') {
    return 'Transcript unavailable';
  }

  return 'Transcript ready';
}

function transcriptActionLabel(video: AnalyzedVideo) {
  if (video.transcriptAnalysis) {
    return 'Re-run analysis';
  }

  return 'Analyze this video';
}

function buildAccessMailto(analysis: ChannelAnalysis, video: AnalyzedVideo) {
  const subject = `Single-video analysis access — ${analysis.channelTitle}`;
  const body = [
    'Hi Enlune,',
    '',
    'I’d like access to the single-video analysis workflow.',
    '',
    `Channel: ${analysis.channelTitle}`,
    `Video title: ${video.title}`,
    `Video URL: ${video.url}`,
    '',
    'I understand access is free if I bring my own key.',
  ].join('\n');

  return `mailto:contact@enlune.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function VideoDetailView({ initialAnalysis, videoId }: { initialAnalysis: ChannelAnalysis; videoId: string }) {
  const [analysis] = useState(initialAnalysis);
  const [accessPopupOpen, setAccessPopupOpen] = useState(false);

  const video = useMemo(() => analysis.videos.find((entry) => entry.id === videoId) ?? null, [analysis, videoId]);

  if (!video) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100">
        That video could not be found in this saved analysis.
      </div>
    );
  }

  const engagementRate = safeRatio(video.likeCount, video.viewCount);
  const accessMailtoHref = buildAccessMailto(analysis, video);

  return (
    <>
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <Link className="transition hover:text-white" href={YOUTUBE_ANALYZER_ANALYSES}>
            ← Control center
          </Link>
          <Link className="transition hover:text-white" href={analysisPath(analysis.id)}>
            Back to {analysis.channelTitle}
          </Link>
        </div>

        <div className="mx-auto mt-6 max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/85 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-video bg-zinc-950">
            {video.thumbnailUrl ? (
              <img alt={video.title} className="h-full w-full object-cover" src={video.thumbnailUrl} />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-950 text-sm text-zinc-500">Thumbnail unavailable</div>
            )}

            {video.durationSeconds != null ? (
              <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                {formatDurationLabel(video.durationSeconds)}
              </span>
            ) : null}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-white">{video.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span>{analysis.channelTitle}</span>
                  <span>•</span>
                  <span>{formatPublishedLabel(video)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill label={transcriptStatusLabel(video)} tone={transcriptStatusTone(video)} />
                <a className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5" href={video.url} rel="noreferrer" target="_blank">
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm text-zinc-500">Views</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(video.viewCount)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm text-zinc-500">Likes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatWholeNumber(video.likeCount)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm text-zinc-500">Duration</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatDurationLabel(video.durationSeconds)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm text-zinc-500">Outlier score</p>
            <p className="mt-2 text-2xl font-semibold text-white">{video.viewOutlierRatio != null ? `${formatDecimal(video.viewOutlierRatio, 2)}x` : '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm text-zinc-500">Engagement rate</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatPercentPrecise(engagementRate)}</p>
          </div>
        </div>

        {video.whyFlagged.length ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-zinc-500">Why it stood out</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {video.whyFlagged.map((reason) => (
                <li className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3" key={reason}>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {video.contextNotes.length ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-sm leading-7 text-zinc-300 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Context notes</p>
            <p className="mt-4">{video.contextNotes.join(' ')}</p>
          </div>
        ) : null}

        <div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5"
              onClick={() => setAccessPopupOpen(true)}
              type="button"
            >
              {transcriptActionLabel(video)}
            </button>
          </div>

          {video.transcriptAnalysis ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
              <TranscriptAnalysisPanel analysis={video.transcriptAnalysis} />
            </div>
          ) : null}
        </div>
      </section>

      {accessPopupOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setAccessPopupOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Want insights for this video?</h2>
                <p className="mt-3 text-sm leading-5 text-zinc-400">
                  Email us to request access. It&apos;s free if you bring your own API key.
                </p>
              </div>
              <button
                aria-label="Close access popup"
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                onClick={() => setAccessPopupOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300">
              <p className="font-medium text-white">{video.title}</p>
              <p className="mt-1 text-zinc-400">{analysis.channelTitle}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300"
                href={accessMailtoHref}
              >
                Email for access
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
