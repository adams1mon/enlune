import * as assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function fileExists(relativePath: string) {
  return existsSync(path.join(projectRoot, relativePath));
}

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('simplified UI route files exist and the old dashboard wrapper is gone', () => {
  assert.equal(fileExists('src/app/analyses/page.tsx'), true);
  assert.equal(fileExists('src/app/analyses/[analysisId]/page.tsx'), true);
  assert.equal(fileExists('src/app/analyses/[analysisId]/videos/[videoId]/page.tsx'), true);
  assert.equal(fileExists('src/components/dashboard/root-entry.tsx'), true);
  assert.equal(fileExists('src/components/dashboard/control-center.tsx'), true);
  assert.equal(fileExists('src/components/dashboard/video-detail-view.tsx'), true);
  assert.equal(fileExists('src/components/dashboard/transcript-analysis-panel.tsx'), true);
  assert.equal(fileExists('src/components/dashboard/dashboard-app.tsx'), false);
});

test('root page becomes a smart entry and analysis results link to dedicated video routes', () => {
  const homePage = readProjectFile('src/app/page.tsx');
  const analysesPage = readProjectFile('src/app/analyses/page.tsx');
  const analysisResults = readProjectFile('src/components/dashboard/analysis-results.tsx');
  const videoDetailView = readProjectFile('src/components/dashboard/video-detail-view.tsx');

  assert.ok(homePage.includes("redirect('/analyses')") || homePage.includes('redirect("/analyses")'));
  assert.ok(homePage.includes("force-dynamic") || homePage.includes("'force-dynamic'"));
  assert.ok(homePage.includes('listSavedAnalyses'));
  assert.ok(homePage.includes('RootEntry'));

  assert.ok(analysesPage.includes("force-dynamic") || analysesPage.includes("'force-dynamic'"));

  assert.ok(!analysisResults.includes('onAnalyzeTranscript'));
  assert.ok(!analysisResults.includes('<details'));
  assert.ok(analysisResults.includes('/videos/'));

  assert.ok(videoDetailView.includes('mx-auto w-full max-w-3xl'));
});
