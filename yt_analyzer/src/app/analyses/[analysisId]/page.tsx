import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AnalysisResults } from '@/components/dashboard/analysis-results';
import { getSavedAnalysis } from '@/server/store/analysis-store';

export const dynamic = 'force-dynamic';

export default async function AnalysisDetailPage({ params }: { params: Promise<{ analysisId: string }> }) {
  const { analysisId } = await params;
  const analysis = await getSavedAnalysis(analysisId);

  if (!analysis) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <div>
          <Link className="text-sm font-medium text-zinc-400 transition hover:text-white" href="/analyses">
            ← Back to analyses
          </Link>
        </div>
        <AnalysisResults analysis={analysis} />
      </div>
    </main>
  );
}
