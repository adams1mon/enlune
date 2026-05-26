import * as assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('compare-specific artifacts are no longer part of the app surface area', () => {
  const removedFiles = [
    'src/components/dashboard/compare-form.tsx',
    'src/components/dashboard/compare-results.tsx',
    'src/app/api/compare/route.ts',
    'src/server/analysis/compare.ts',
    'src/components/dashboard/dashboard-app.tsx',
  ];

  for (const relativePath of removedFiles) {
    assert.equal(existsSync(path.join(projectRoot, relativePath)), false, `${relativePath} should be removed`);
  }

  const apiContracts = readProjectFile('src/lib/contracts/api.ts');
  const schemas = readProjectFile('src/lib/contracts/schemas.ts');
  const analysisTypes = readProjectFile('src/lib/types/analysis.ts');
  const analyzeChannelService = readProjectFile('src/server/services/analyze-channel.ts');
  const homePage = readProjectFile('src/app/page.tsx');

  assert.ok(!apiContracts.includes('CompareSavedAnalyses'));
  assert.ok(!schemas.includes('compareSavedAnalysesSchema'));
  assert.ok(!analysisTypes.includes('ChannelCompareResult'));
  assert.ok(!analyzeChannelService.includes('experiments:'));
  assert.ok(!homePage.includes('/api/compare'));
});
