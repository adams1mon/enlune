'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AnalyzeChannelResponse } from '@/lib/contracts/api';
import { cn } from '@/lib/utils';

interface AnalysisFormProps {
  title?: string;
  description?: string;
  chrome?: 'card' | 'bare';
  className?: string;
}

export function AnalysisForm({ title, description, chrome = 'card', className }: AnalysisFormProps) {
  const router = useRouter();
  const [channelInput, setChannelInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedInput = channelInput.trim();
    if (!normalizedInput) {
      setError('Paste a YouTube channel URL or handle.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelInput: normalizedInput, save: true }),
      });
      const payload = (await response.json()) as AnalyzeChannelResponse;

      if (!payload.ok) {
        throw new Error(payload.error.message);
      }

      router.push(`/analyses/${payload.data.id}`);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to analyze that channel.');
    } finally {
      setBusy(false);
    }
  }

  const content = (
    <>
      {title || description ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{title}</p> : null}
            {description ? <h2 className="mt-2 text-xl font-semibold text-white">{description}</h2> : null}
          </div>
        </div>
      ) : null}

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

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">Supports @handle, /@handle, or /channel/UC... links.</p>
          <button
            className="inline-flex items-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </form>
    </>
  );

  if (chrome === 'bare') {
    return <div className={className}>{content}</div>;
  }

  return (
    <section className={cn('rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]', className)}>
      {content}
    </section>
  );
}
