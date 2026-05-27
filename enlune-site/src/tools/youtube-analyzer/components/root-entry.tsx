import Link from 'next/link';

import { AnalysisForm } from '@/tools/youtube-analyzer/components/analysis-form';
import { YOUTUBE_ANALYZER_TRANSCRIPT } from '@/tools/youtube-analyzer/lib/paths';

export function RootEntry() {
  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-zinc-100 lg:px-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Channel analysis</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Paste a YouTube channel and see what’s actually working.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            You’ll get a fast breakdown of recent videos, outliers, and the patterns worth copying.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/50 p-5 sm:p-6">
            <AnalysisForm chrome="bare" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span>Want just one video?</span>
            <Link className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/20 hover:bg-white/5" href={YOUTUBE_ANALYZER_TRANSCRIPT}>
              Analyze a single video
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
