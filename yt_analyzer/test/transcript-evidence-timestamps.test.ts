import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeEvidenceTimestampToTranscriptFormat } from '../src/lib/transcript-timestamps.ts';

test('normalizeEvidenceTimestampToTranscriptFormat preserves transcript-native second values', () => {
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('1530-1555'), '1530-1555');
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('12.5-18.25'), '12.5-18.25');
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('42'), '42');
});

test('normalizeEvidenceTimestampToTranscriptFormat converts mm:ss timestamps into transcript-style seconds', () => {
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('00:12'), '12');
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('0:00-0:40'), '0-40');
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('12:00-13:00'), '720-780');
});

test('normalizeEvidenceTimestampToTranscriptFormat converts hh:mm:ss timestamps into transcript-style seconds', () => {
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat('1:02:03'), '3723');
  assert.equal(normalizeEvidenceTimestampToTranscriptFormat(' 1:02:03 - 1:02:05.500 '), '3723-3725.5');
});
