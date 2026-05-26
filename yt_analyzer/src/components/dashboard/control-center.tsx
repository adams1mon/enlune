import type { SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import { AnalysisForm } from '@/components/dashboard/analysis-form';
import { SavedAnalysesPanel } from '@/components/dashboard/saved-analyses-panel';

export function ControlCenter({ analyses }: { analyses: SavedChannelAnalysisSummary[] }) {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your analysis control center.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
            Analyze a new channel or view saved snapshots below.
          </p>
        </header>

        <AnalysisForm title="Add a channel" description="Paste a YouTube channel and open the saved snapshot." />
        <SavedAnalysesPanel analyses={analyses} />
      </div>
    </main>
  );
}
