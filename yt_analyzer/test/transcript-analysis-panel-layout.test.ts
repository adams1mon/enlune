import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('transcript analysis panel uses a report-style vertical layout with larger evidence callouts', () => {
  const componentContent = readProjectFile('src/components/dashboard/transcript-analysis-panel.tsx');

  assert.ok(componentContent.includes('function ReportSection('));
  assert.ok(componentContent.includes('function EvidenceQuote('));
  assert.ok(componentContent.includes('function TranscriptEvidenceList('));
  assert.ok(componentContent.includes('border-l-2 border-white/10 pl-4 text-sm leading-7 text-zinc-200'));
  assert.ok(!componentContent.includes('mt-4 grid gap-3 xl:grid-cols-3'));
  assert.ok(!componentContent.includes('space-y-2 text-xs text-zinc-300'));
});
