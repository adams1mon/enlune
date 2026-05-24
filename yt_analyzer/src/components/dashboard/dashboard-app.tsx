'use client';

import { useEffect, useState } from 'react';

import type {
  AnalyzeChannelResponse,
  CompareSavedAnalysesResponse,
  SavedAnalysesResponse,
} from '@/lib/contracts/api';
import type { ChannelAnalysis, ChannelCompareResult, SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import { AnalysisForm } from '@/components/dashboard/analysis-form';
import { AnalysisResults } from '@/components/dashboard/analysis-results';
import { CompareForm } from '@/components/dashboard/compare-form';
import { CompareResults } from '@/components/dashboard/compare-results';
import { SavedAnalysesPanel } from '@/components/dashboard/saved-analyses-panel';

export function DashboardApp() {
  const [analyses, setAnalyses] = useState<SavedChannelAnalysisSummary[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<ChannelAnalysis | null>(null);
  const [latestCompare, setLatestCompare] = useState<ChannelCompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzeBusy, setAnalyzeBusy] = useState(false);
  const [compareBusy, setCompareBusy] = useState(false);
  const [savedBusy, setSavedBusy] = useState(false);

  async function loadSaved(selectedAnalysisId?: string) {
    setSavedBusy(true);
    try {
      const url = selectedAnalysisId ? `/api/saved?analysisId=${encodeURIComponent(selectedAnalysisId)}` : '/api/saved';
      const response = await fetch(url, { cache: 'no-store' });
      const payload = (await response.json()) as SavedAnalysesResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setAnalyses(payload.data.analyses);
      if (payload.data.analysis) {
        setLatestAnalysis(payload.data.analysis);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load saved analyses.');
    } finally {
      setSavedBusy(false);
    }
  }

  useEffect(() => {
    void loadSaved();
  }, []);

  async function handleAnalyze(channelInput: string) {
    setAnalyzeBusy(true);
    setError(null);
    setLatestCompare(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelInput, save: true }),
      });
      const payload = (await response.json()) as AnalyzeChannelResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setLatestAnalysis(payload.data);
      await loadSaved();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to analyze that channel.');
    } finally {
      setAnalyzeBusy(false);
    }
  }

  async function handleCompare(leftAnalysisId: string, rightAnalysisId: string) {
    setCompareBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leftAnalysisId, rightAnalysisId }),
      });
      const payload = (await response.json()) as CompareSavedAnalysesResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setLatestCompare(payload.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to compare those analyses.');
    } finally {
      setCompareBusy(false);
    }
  }

  async function handleDeleteSavedAnalysis(analysisId: string) {
    setSavedBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/saved?analysisId=${encodeURIComponent(analysisId)}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as SavedAnalysesResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      setAnalyses(payload.data.analyses);
      setLatestAnalysis((current) => (current?.id === analysisId ? null : current));
      setLatestCompare((current) =>
        current && (current.leftAnalysisId === analysisId || current.rightAnalysisId === analysisId) ? null : current,
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to delete that saved analysis.');
    } finally {
      setSavedBusy(false);
    }
  }

  const canCompare = analyses.length >= 2;

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Enlune • YouTube channel analyzer MVP</p>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Spot the outliers, inspect the packaging, keep the useful patterns.</h1>
            <p className="mt-4 text-base leading-7 text-zinc-300 sm:text-lg">
              A deliberately lightweight channel teardown tool: recent-video sampling, outlier detection, transcript-backed heuristics, saved snapshots, and saved-vs-saved comparison.
            </p>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <AnalysisForm busy={analyzeBusy} onAnalyze={handleAnalyze} />
          <CompareForm analyses={analyses} busy={compareBusy} disabled={!canCompare} onCompare={handleCompare} />
        </div>

        <SavedAnalysesPanel analyses={analyses} busy={savedBusy} onDelete={handleDeleteSavedAnalysis} onOpen={loadSaved} />

        {latestAnalysis ? <AnalysisResults analysis={latestAnalysis} /> : null}
        {latestCompare ? <CompareResults analyses={analyses} result={latestCompare} /> : null}
      </div>
    </main>
  );
}
