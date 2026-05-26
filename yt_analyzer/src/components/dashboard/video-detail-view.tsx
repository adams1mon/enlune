'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AnalyzeVideoTranscriptResponse } from '@/lib/contracts/api';
import type { AnalyzedVideo, ChannelAnalysis } from '@/lib/types/analysis';
import { StatusPill } from '@/components/ui/status-pill';
import { formatCompactNumber, formatDecimal, safeRatio } from '@/lib/utils';
import { TranscriptAnalysisPanel } from '@/components/dashboard/transcript-analysis-panel';

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

export function VideoDetailView({ initialAnalysis, videoId }: { initialAnalysis: ChannelAnalysis; videoId: string }) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const video = useMemo(() => analysis.videos.find((entry) => entry.id === videoId) ?? null, [analysis, videoId]);

  if (!video) {
    return (
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100">
        That video could not be found in this saved analysis.
      </div>
    );
  }

  const engagementRate = safeRatio(video.likeCount, video.viewCount);
  const currentVideo: AnalyzedVideo = video;

  async function handleAnalyzeTranscript() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId: analysis.id, videoId: currentVideo.id }),
      });
      const payload = (await response.json()) as AnalyzeVideoTranscriptResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setAnalysis(payload.data);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to analyze that transcript.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="max-w-md mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/85 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
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
              <a className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5" href={video.url} rel="noreferrer" target="_blank">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:text-zinc-500"
            disabled={busy}
            onClick={() => {
              void handleAnalyzeTranscript();
            }}
            type="button"
          >
            {busy ? 'Running AI analysis…' : transcriptActionLabel(video)}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        {video.transcriptAnalysis ? (
          <div className="mt-4">
            <TranscriptAnalysisPanel analysis={video.transcriptAnalysis} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
