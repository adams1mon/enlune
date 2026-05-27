'use client';

import { useEffect, useState } from 'react';

import { AnalysisNotFoundState } from '@/tools/youtube-analyzer/components/analysis-not-found-state';
import { AnalysisResults } from '@/tools/youtube-analyzer/components/analysis-results';
import { getClientAnalysis, subscribeToClientAnalysisStore } from '@/tools/youtube-analyzer/lib/client-analysis-store';
import type { ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';

export function AnalysisDetailRouteClient({ analysisId }: { analysisId: string }) {
  const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setAnalysis(getClientAnalysis(analysisId));
      setHydrated(true);
    };

    sync();
    return subscribeToClientAnalysisStore(sync);
  }, [analysisId]);

  if (!hydrated) {
    return <main className="min-h-screen bg-[#09090b]" />;
  }

  if (!analysis) {
    return <AnalysisNotFoundState />;
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-10 text-zinc-100 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <AnalysisResults key={analysis.id} analysis={analysis} />
      </div>
    </main>
  );
}
