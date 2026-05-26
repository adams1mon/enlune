import { AnalysisForm } from '@/components/dashboard/analysis-form';

export function RootEntry() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12 lg:px-8">
        <section className="w-full rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Channel analysis</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            See what’s actually working on a YouTube channel.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Paste a channel to get a fast snapshot of the videos, outliers, and transcript patterns.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/50 p-5 sm:p-6">
            <AnalysisForm chrome="bare" />
          </div>
        </section>
      </div>
    </main>
  );
}
