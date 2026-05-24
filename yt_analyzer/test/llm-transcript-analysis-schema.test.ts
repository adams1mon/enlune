import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmTranscriptAnalysisSchema } from '../src/server/llm/transcript-analysis-schema.ts';

function repeat(char: string, length: number) {
  return char.repeat(length);
}

function buildDimension() {
  return {
    score: 4,
    verdict: repeat('v', 480),
    evidence: [
      {
        timestamp: '00:12',
        snippet: repeat('s', 360),
        note: repeat('n', 280),
      },
    ],
  };
}

test('llm transcript schema accepts longer but still bounded concise fields', () => {
  const parsed = llmTranscriptAnalysisSchema.parse({
    overview: {
      summary: repeat('a', 1100),
      valueType: 'tactical breakdown',
    },
    dimensions: {
      valuePropositionClarity: buildDimension(),
      audienceTargeting: {
        ...buildDimension(),
        intendedAudience: repeat('i', 200),
        audienceLevel: repeat('l', 140),
      },
      timeToValue: {
        ...buildDimension(),
        secondsToValue: 42,
      },
      openLoopsRetentionStructure: buildDimension(),
      payoffDelivery: buildDimension(),
      pacing: buildDimension(),
      humorSurpriseTensionConflict: {
        ...buildDimension(),
        dominantDrivers: ['surprise', 'tension'],
      },
      practicalUtilityDepth: buildDimension(),
      credibilityQuality: buildDimension(),
      filler: buildDimension(),
      repetition: buildDimension(),
      sponsorIntrusion: buildDimension(),
      ctaOverload: buildDimension(),
      titlePromiseVsTranscriptDelivery: buildDimension(),
      thumbnailTitleComplementarity: {
        ...buildDimension(),
        visualRead: repeat('p', 280),
      },
    },
    strengths: [repeat('x', 280)],
    risks: [repeat('y', 280)],
    recommendations: [repeat('z', 280)],
  });

  assert.equal(parsed.overview.summary.length, 1100);
  assert.equal(parsed.dimensions.valuePropositionClarity.verdict.length, 480);
  assert.equal(parsed.strengths[0]?.length, 280);
});
