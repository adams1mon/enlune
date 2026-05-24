'use client';

import type { ChannelCompareResult, SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import { StatusPill } from '@/components/ui/status-pill';

interface CompareResultsProps {
  analyses: SavedChannelAnalysisSummary[];
  result: ChannelCompareResult;
}

function nameFor(id: string, analyses: SavedChannelAnalysisSummary[]) {
  return analyses.find((analysis) => analysis.id === id)?.channelTitle ?? 'Unknown channel';
}

export function CompareResults({ analyses, result }: CompareResultsProps) {
  const leftName = nameFor(result.leftAnalysisId, analyses);
  const rightName = nameFor(result.rightAnalysisId, analyses);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Comparison</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{leftName} vs {rightName}</h2>
        </div>
        <StatusPill label="saved vs saved" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-white">Pattern overlap</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {result.overlapPatterns.length ? result.overlapPatterns.map((pattern) => <li key={pattern}>{pattern}</li>) : <li>No strong overlap surfaced.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-white">{leftName} does more of</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {result.leftDoesMoreOf.length ? result.leftDoesMoreOf.map((item) => <li key={item}>{item}</li>) : <li>No clear edge surfaced.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-white">{rightName} does more of</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {result.rightDoesMoreOf.length ? result.rightDoesMoreOf.map((item) => <li key={item}>{item}</li>) : <li>No clear edge surfaced.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
        <p className="text-sm font-medium text-white">Borrowing ideas</p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          {result.borrowingIdeas.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      </div>

      {result.warnings.length ? (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-100">Comparison caveats</p>
          <ul className="mt-2 space-y-2 text-sm text-amber-50/85">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
