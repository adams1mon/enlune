'use client';

import { formatDistanceToNow } from 'date-fns';

import type { SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import { formatCompactNumber, formatPercent } from '@/lib/utils';

interface SavedAnalysesPanelProps {
  analyses: SavedChannelAnalysisSummary[];
  busy: boolean;
  onOpen: (analysisId: string) => Promise<void>;
  onDelete: (analysisId: string) => Promise<void>;
}

export function SavedAnalysesPanel({ analyses, busy, onOpen, onDelete }: SavedAnalysesPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Saved analyses</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Your reusable channel snapshots.</h2>
        </div>
        <div className="text-sm text-zinc-500">{analyses.length} saved</div>
      </div>

      <div className="mt-5 space-y-3">
        {!analyses.length ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 px-4 py-6 text-sm text-zinc-500">
            No saved analyses yet. Run one channel analysis and it will appear here automatically.
          </div>
        ) : (
          analyses.map((analysis) => (
            <article
              className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4"
              key={analysis.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-white">{analysis.channelTitle}</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Saved {formatDistanceToNow(new Date(analysis.analyzedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
                <div>
                  <p className="text-zinc-500">Median views</p>
                  <p className="mt-1 text-white">{formatCompactNumber(analysis.medianViews)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Transcript coverage</p>
                  <p className="mt-1 text-white">{formatPercent(analysis.transcriptCoverage)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Sample size</p>
                  <p className="mt-1 text-white">{analysis.videoSampleSize} videos</p>
                </div>
              </div>

              {analysis.topTakeaway ? (
                <p className="mt-4 text-sm text-zinc-300">{analysis.topTakeaway}</p>
              ) : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:text-zinc-500"
                  disabled={busy}
                  onClick={() => onOpen(analysis.id)}
                  type="button"
                >
                  Open snapshot
                </button>
                <button
                  className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-500/35 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-transparent disabled:text-zinc-500"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete the saved analysis for ${analysis.channelTitle}?`)) {
                      void onDelete(analysis.id);
                    }
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
