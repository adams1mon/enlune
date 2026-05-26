'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import type { SavedAnalysesResponse } from '@/lib/contracts/api';
import type { SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import { formatCompactNumber } from '@/lib/utils';

interface SavedAnalysesPanelProps {
  analyses: SavedChannelAnalysisSummary[];
}

export function SavedAnalysesPanel({ analyses }: SavedAnalysesPanelProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(analysisId: string, channelTitle: string) {
    if (!window.confirm(`Delete the saved analysis for ${channelTitle}?`)) {
      return;
    }

    setBusyId(analysisId);
    setError(null);

    try {
      const response = await fetch(`/api/saved?analysisId=${encodeURIComponent(analysisId)}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as SavedAnalysesResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to delete that saved analysis.');
    } finally {
      setBusyId((current) => (current === analysisId ? null : current));
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Saved analyses</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Open the snapshot you want to inspect next.</h2>
        </div>
        <div className="text-sm text-zinc-500">{analyses.length} saved</div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      <div className="mt-5 space-y-3">
        {!analyses.length ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 px-4 py-6 text-sm text-zinc-500">
            No saved analyses yet. Run one channel analysis and it will appear here automatically.
          </div>
        ) : (
          analyses.map((analysis) => {
            const deleting = busyId === analysis.id;

            return (
              <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 transition hover:border-white/20 hover:bg-zinc-950/90" key={analysis.id}>
                <Link className="block" href={`/analyses/${analysis.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-medium text-white">{analysis.channelTitle}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Saved {formatDistanceToNow(new Date(analysis.analyzedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Open analysis</span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
                    <div>
                      <p className="text-zinc-500">Median views</p>
                      <p className="mt-1 text-white">{formatCompactNumber(analysis.medianViews)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">AI transcript analyses</p>
                      <p className="mt-1 text-white">{analysis.aiTranscriptAnalysisCount}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Sample size</p>
                      <p className="mt-1 text-white">{analysis.videoSampleSize} videos</p>
                    </div>
                  </div>

                  {analysis.topTakeaway ? (
                    <p className="mt-4 text-sm text-zinc-300">{analysis.topTakeaway}</p>
                  ) : null}
                </Link>

                <div className="mt-4 flex justify-end">
                  <button
                    className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-500/35 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-transparent disabled:text-zinc-500"
                    disabled={deleting}
                    onClick={() => {
                      void handleDelete(analysis.id, analysis.channelTitle);
                    }}
                    type="button"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
