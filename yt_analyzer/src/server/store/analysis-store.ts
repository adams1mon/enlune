import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { ChannelAnalysis, SavedChannelAnalysisSummary } from '@/lib/types/analysis';
import type { AnalysisStoreData } from '@/lib/types/storage';
import { AppError } from '@/server/errors';

const STORE_PATH = path.join(process.cwd(), 'data', 'analyses.json');
const TEMP_PATH = `${STORE_PATH}.tmp`;

const EMPTY_STORE: AnalysisStoreData = {
  schemaVersion: 1,
  analyses: {},
};

let writeQueue = Promise.resolve();

function summarizeAnalysis(analysis: ChannelAnalysis): SavedChannelAnalysisSummary {
  return {
    id: analysis.id,
    channelTitle: analysis.channelTitle,
    channelUrl: analysis.channelUrl,
    analyzedAt: analysis.analyzedAt,
    videoSampleSize: analysis.videoSampleSize,
    transcriptCoverage: analysis.transcriptCoverage,
    medianViews: analysis.medianViews,
    topTakeaway: analysis.findings[0] ?? null,
    dataQuality: analysis.dataQuality,
  };
}

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2), 'utf8');
  }
}

function normalizeStore(raw: unknown): AnalysisStoreData {
  if (!raw || typeof raw !== 'object') return EMPTY_STORE;

  const candidate = raw as Partial<AnalysisStoreData>;
  if (candidate.schemaVersion !== 1 || !candidate.analyses || typeof candidate.analyses !== 'object') {
    return EMPTY_STORE;
  }

  return {
    schemaVersion: 1,
    analyses: candidate.analyses,
  };
}

export async function readStore(): Promise<AnalysisStoreData> {
  try {
    await ensureStoreFile();
    const file = await fs.readFile(STORE_PATH, 'utf8');
    if (!file.trim()) return EMPTY_STORE;
    return normalizeStore(JSON.parse(file));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return EMPTY_STORE;
    }

    throw new AppError('STORE_READ_FAILED', 'Unable to read the saved analyses store.');
  }
}

async function writeStore(nextStore: AnalysisStoreData) {
  writeQueue = writeQueue.then(async () => {
    try {
      await ensureStoreFile();
      await fs.writeFile(TEMP_PATH, JSON.stringify(nextStore, null, 2), 'utf8');
      await fs.rename(TEMP_PATH, STORE_PATH);
    } catch {
      throw new AppError('STORE_WRITE_FAILED', 'Unable to write the saved analyses store.');
    }
  });

  return writeQueue;
}

export async function listSavedAnalyses() {
  const store = await readStore();
  return Object.values(store.analyses)
    .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
    .map(summarizeAnalysis);
}

export async function getSavedAnalysis(analysisId: string) {
  const store = await readStore();
  return store.analyses[analysisId] ?? null;
}

export async function saveChannelAnalysis(analysis: ChannelAnalysis) {
  const store = await readStore();
  const nextStore: AnalysisStoreData = {
    ...store,
    analyses: {
      ...store.analyses,
      [analysis.id]: analysis,
    },
  };

  await writeStore(nextStore);
  return summarizeAnalysis(analysis);
}

export async function deleteSavedAnalysis(analysisId: string) {
  const store = await readStore();

  if (!store.analyses[analysisId]) {
    throw new AppError('ANALYSIS_NOT_FOUND', 'That saved analysis could not be found.');
  }

  const nextAnalyses = { ...store.analyses };
  delete nextAnalyses[analysisId];

  await writeStore({
    ...store,
    analyses: nextAnalyses,
  });
}
