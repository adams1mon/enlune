import Link from 'next/link';

import { YOUTUBE_ANALYZER_ROOT } from '@/tools/youtube-analyzer/lib/paths';

export function AnalysisNotFoundState({
  title = 'Analysis not found in this browser.',
  body = 'This analysis is only stored locally, so it may have been deleted or created in another browser.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-12 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">YouTube analyzer</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">{body}</p>
        <div className="mt-8">
          <Link className="inline-flex items-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5" href={YOUTUBE_ANALYZER_ROOT}>
            Back to analyzer home
          </Link>
        </div>
      </div>
    </main>
  );
}
