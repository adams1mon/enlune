'use client';

import { FormEvent, useState } from 'react';

interface AnalysisFormProps {
  busy: boolean;
  onAnalyze: (channelInput: string) => Promise<void>;
}

export function AnalysisForm({ busy, onAnalyze }: AnalysisFormProps) {
  const [channelInput, setChannelInput] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAnalyze(channelInput);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Analyze a channel</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Paste a YouTube channel and get a usable teardown.</h2>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm text-zinc-300">
          Channel URL or handle
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
            disabled={busy}
            onChange={(event) => setChannelInput(event.target.value)}
            placeholder="https://www.youtube.com/@ChannelName or @ChannelName"
            value={channelInput}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">Supports @handle, /@handle, or /channel/UC... links.</p>
          <button
            className="inline-flex items-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Analyzing…' : 'Run analysis'}
          </button>
        </div>
      </form>
    </section>
  );
}
