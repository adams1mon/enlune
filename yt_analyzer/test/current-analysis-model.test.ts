import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('analysis store persists the current snapshot model directly without migration helpers', () => {
  const content = readProjectFile('src/server/store/analysis-store.ts');

  assert.ok(!content.includes('normalizeSavedAnalysis('));
  assert.ok(!content.includes('LEGACY_TRANSCRIPT_WARNING'));
});

test('saved analysis summary exposes current fields', () => {
  const content = readProjectFile('src/lib/types/analysis.ts');

  assert.ok(content.includes('aiTranscriptAnalysisCount: number;'));
  assert.ok(content.includes('topTakeaway: string | null;'));
});

test('saved analysis data uses the current snapshot shape', () => {
  const raw = readProjectFile('data/analyses.json');
  const store = JSON.parse(raw) as {
    analyses: Record<string, { aiTranscriptAnalysisCount?: unknown; topTakeaway?: unknown }>;
  };

  for (const analysis of Object.values(store.analyses)) {
    assert.equal(typeof analysis, 'object');
    assert.equal(analysis === null, false);
  }
});
