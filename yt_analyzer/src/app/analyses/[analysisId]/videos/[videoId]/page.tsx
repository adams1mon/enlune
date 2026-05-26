import Link from 'next/link';
import { notFound } from 'next/navigation';

import { VideoDetailView } from '@/components/dashboard/video-detail-view';
import { getSavedAnalysis } from '@/server/store/analysis-store';

export const dynamic = 'force-dynamic';

export default async function VideoDetailPage({ params }: { params: Promise<{ analysisId: string; videoId: string }> }) {
  const { analysisId, videoId } = await params;
  const analysis = await getSavedAnalysis(analysisId);

  if (!analysis) {
    notFound();
  }

  const video = analysis.videos.find((entry) => entry.id === videoId);
  if (!video) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <Link className="transition hover:text-white" href="/analyses">
            Analyses
          </Link>
          <span>/</span>
          <Link className="transition hover:text-white" href={`/analyses/${analysisId}`}>
            {analysis.channelTitle}
          </Link>
          <span>/</span>
          <span className="text-zinc-200">Video detail</span>
        </div>
        <VideoDetailView initialAnalysis={analysis} videoId={videoId} />
      </div>
    </main>
  );
}
