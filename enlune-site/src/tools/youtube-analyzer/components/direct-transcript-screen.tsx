'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { YOUTUBE_ANALYZER_ROOT } from '@/tools/youtube-analyzer/lib/paths';

export function DirectTranscriptScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const mailtoHref = useMemo(() => {
    const subject = `Single-video access request${name ? ` — ${name}` : ''}`;
    const body = [
      'Hi Enlune,',
      '',
      'I’d like access to the single-video analysis tool.',
      '',
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Video URL: ${videoUrl || '-'}`,
      '',
      'Notes:',
      notes || '-',
      '',
      'I understand access is free if I bring my own key.',
    ].join('\n');

    return `mailto:contact@enlune.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, name, notes, videoUrl]);

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-10 text-zinc-100 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.96))] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Single video analysis</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Want single-video analysis?</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                Request access below. It&apos;s free if you bring your own key.
              </p>
            </div>
            <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/5" href={YOUTUBE_ANALYZER_ROOT}>
              Back to analyzer home
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Request access</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Tell us what you want to analyze.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Share the video you care about and a bit of context. We&apos;ll point you to the right setup for access.
              </p>
            </div>

            <form className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-zinc-300">
                  Name
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    value={name}
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Email
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                  />
                </label>
              </div>

              <label className="block text-sm text-zinc-300">
                Video URL
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                />
              </label>

              <label className="block text-sm text-zinc-300">
                What do you want to learn from this video?
                <textarea
                  className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Examples: why it worked, hook breakdown, retention clues, CTA teardown, angle ideas..."
                  value={notes}
                />
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  className="inline-flex items-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300"
                  href={mailtoHref}
                >
                  Request access
                </a>
                <a
                  className="inline-flex items-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5"
                  href="mailto:contact@enlune.com"
                >
                  Email us directly
                </a>
              </div>
            </form>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">What you get</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">A focused single-video workflow.</h2>

            <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
              <li className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3">
                Clear breakdown of what made the video work.
              </li>
              <li className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3">
                Hook, structure, and angle insights you can reuse.
              </li>
              <li className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3">
                Free access if you bring your own key.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Bring your own key, send the video you care about, and we&apos;ll help you unlock the right setup.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
