'use client';

import { FormEvent, useMemo, useState } from 'react';

import type { SavedChannelAnalysisSummary } from '@/lib/types/analysis';

interface CompareFormProps {
  analyses: SavedChannelAnalysisSummary[];
  busy: boolean;
  disabled?: boolean;
  onCompare: (leftAnalysisId: string, rightAnalysisId: string) => Promise<void>;
}

export function CompareForm({ analyses, busy, disabled = false, onCompare }: CompareFormProps) {
  const [leftAnalysisId, setLeftAnalysisId] = useState('');
  const [rightAnalysisId, setRightAnalysisId] = useState('');

  const options = useMemo(() => analyses.slice(0, 20), [analyses]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCompare(leftAnalysisId, rightAnalysisId);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Compare saved analyses</p>
      <h2 className="mt-2 text-xl font-semibold text-white">See what one channel is doing that the other is not.</h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-zinc-300">
          Channel A
          <select
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
            disabled={busy || disabled || !options.length}
            onChange={(event) => setLeftAnalysisId(event.target.value)}
            value={leftAnalysisId}
          >
            <option value="">Select a saved analysis</option>
            {options.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>
                {analysis.channelTitle}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-zinc-300">
          Channel B
          <select
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
            disabled={busy || disabled || !options.length}
            onChange={(event) => setRightAnalysisId(event.target.value)}
            value={rightAnalysisId}
          >
            <option value="">Select another saved analysis</option>
            {options.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>
                {analysis.channelTitle}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">Select two saved analyses to compare.</p>
          <button
            className="inline-flex items-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-zinc-500"
            disabled={busy || disabled || !leftAnalysisId || !rightAnalysisId}
            type="submit"
          >
            {busy ? 'Comparing…' : 'Compare'}
          </button>
        </div>
      </form>
    </section>
  );
}
