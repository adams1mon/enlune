'use client';

import { useEffect, useState } from 'react';

import { AnalysisForm } from '@/tools/youtube-analyzer/components/analysis-form';
import { RootEntry } from '@/tools/youtube-analyzer/components/root-entry';
import { SavedAnalysesPanel } from '@/tools/youtube-analyzer/components/saved-analyses-panel';
import { deleteClientAnalysis, listClientAnalyses, subscribeToClientAnalysisStore, summarizeAnalysis } from '@/tools/youtube-analyzer/lib/client-analysis-store';
import type { SavedChannelAnalysisSummary } from '@/tools/youtube-analyzer/types/analysis';

export function ControlCenterScreen() {
  const [summaries, setSummaries] = useState<SavedChannelAnalysisSummary[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setSummaries(listClientAnalyses().map(summarizeAnalysis));
    };

    sync();
    return subscribeToClientAnalysisStore(sync);
  }, []);

  function handleDelete(analysisId: string, channelTitle: string) {
    if (!window.confirm(`Delete the saved analysis for ${channelTitle}?`)) {
      return;
    }

    setDeletingId(analysisId);
    setError(null);

    try {
      deleteClientAnalysis(analysisId);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to delete that saved analysis.');
    } finally {
      setDeletingId((current) => (current === analysisId ? null : current));
    }
  }

  if (summaries.length === 0) {
    return <RootEntry />;
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your analysis control center.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Analyze a new channel, revisit a saved snapshot, or jump into a single video view.
          </p>
        </header>

        <AnalysisForm title="Add a channel" description="Paste a YouTube channel and open the analysis when it’s ready." />
        <SavedAnalysesPanel analyses={summaries} deletingId={deletingId} error={error} onDelete={handleDelete} />
      </div>
    </main>
  );
}
