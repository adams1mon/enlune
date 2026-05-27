'use client';

import { useEffect, useState } from 'react';

import { AnalysisNotFoundState } from '@/tools/youtube-analyzer/components/analysis-not-found-state';
import { VideoDetailView } from '@/tools/youtube-analyzer/components/video-detail-view';
import { getClientAnalysis, subscribeToClientAnalysisStore } from '@/tools/youtube-analyzer/lib/client-analysis-store';
import type { ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';

export function VideoDetailRouteClient({ analysisId, videoId }: { analysisId: string; videoId: string }) {
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
    return <AnalysisNotFoundState body="This saved analysis is only available in the browser where it was created." />;
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-10 text-zinc-100 lg:px-8">
      <VideoDetailView initialAnalysis={analysis} videoId={videoId} />
    </main>
  );
}
