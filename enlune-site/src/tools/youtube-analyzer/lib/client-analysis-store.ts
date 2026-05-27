'use client';

import type { ChannelAnalysis, SavedChannelAnalysisSummary } from '@/tools/youtube-analyzer/types/analysis';
import { firstSentence } from '@/tools/youtube-analyzer/lib/utils';

const STORAGE_KEY = 'enlune.youtube-analyzer.analyses';
const STORE_EVENT = 'enlune-youtube-analyzer-store-changed';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readAllUnsafe(): ChannelAnalysis[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ChannelAnalysis => Boolean(item) && typeof item === 'object' && typeof (item as ChannelAnalysis).id === 'string');
  } catch {
    return [];
  }
}

function writeAllUnsafe(analyses: ChannelAnalysis[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

function sortAnalyses(analyses: ChannelAnalysis[]) {
  return [...analyses].sort((left, right) => {
    const leftTime = new Date(left.analyzedAt).getTime();
    const rightTime = new Date(right.analyzedAt).getTime();
    return rightTime - leftTime;
  });
}

export function listClientAnalyses() {
  return sortAnalyses(readAllUnsafe());
}

export function getClientAnalysis(analysisId: string) {
  return readAllUnsafe().find((analysis) => analysis.id === analysisId) ?? null;
}

export function upsertClientAnalysis(nextAnalysis: ChannelAnalysis) {
  const existing = readAllUnsafe().filter((analysis) => analysis.id !== nextAnalysis.id);
  writeAllUnsafe(sortAnalyses([nextAnalysis, ...existing]));
}

export function deleteClientAnalysis(analysisId: string) {
  writeAllUnsafe(readAllUnsafe().filter((analysis) => analysis.id !== analysisId));
}

export function clearClientAnalyses() {
  writeAllUnsafe([]);
}

export function summarizeAnalysis(analysis: ChannelAnalysis): SavedChannelAnalysisSummary {
  return {
    id: analysis.id,
    channelTitle: analysis.channelTitle,
    channelUrl: analysis.channelUrl,
    analyzedAt: analysis.analyzedAt,
    videoSampleSize: analysis.videoSampleSize,
    aiTranscriptAnalysisCount: analysis.videos.filter((video) => Boolean(video.transcriptAnalysis)).length,
    medianViews: analysis.medianViews,
    topTakeaway: firstSentence(analysis.findings[0] ?? null),
  };
}

export function subscribeToClientAnalysisStore(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => callback();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
