import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ChannelAnalysis, VideoTranscriptAnalysis } from '../src/lib/types/analysis.ts';
import { applyVideoTranscriptAnalysis } from '../src/lib/transcript-analysis-snapshot.ts';

function buildTranscriptAnalysis(): VideoTranscriptAnalysis {
  const dimension = {
    score: 4 as const,
    verdict: 'Clear and specific.',
    evidence: [
      {
        timestamp: '00:12',
        snippet: 'A useful section from the transcript.',
        note: 'Shows the promise early.',
      },
    ],
  };

  return {
    method: 'llm',
    provider: 'openai-compatible',
    model: 'gpt-test',
    analyzedAt: '2026-05-25T00:00:00.000Z',
    transcriptCharacters: 1200,
    transcriptCharactersSent: 1200,
    transcriptExcerpted: false,
    overview: {
      summary: 'The transcript quickly establishes value.',
      valueType: 'tutorial',
    },
    dimensions: {
      valuePropositionClarity: dimension,
      audienceTargeting: {
        ...dimension,
        intendedAudience: 'Founders',
        audienceLevel: 'Intermediate',
      },
      timeToValue: {
        ...dimension,
        secondsToValue: 12,
      },
      openLoopsRetentionStructure: dimension,
      payoffDelivery: dimension,
      pacing: dimension,
      humorSurpriseTensionConflict: {
        ...dimension,
        dominantDrivers: ['surprise'],
      },
      practicalUtilityDepth: dimension,
      credibilityQuality: dimension,
      filler: dimension,
      repetition: dimension,
      sponsorIntrusion: dimension,
      ctaOverload: dimension,
      titlePromiseVsTranscriptDelivery: dimension,
      thumbnailTitleComplementarity: {
        ...dimension,
        visualRead: 'Simple thumbnail with one clear claim.',
      },
    },
    strengths: ['Gets to the point quickly.'],
    risks: ['Could use one stronger example.'],
    recommendations: ['Lead with the transformation even earlier.'],
  };
}

function buildAnalysis(): ChannelAnalysis {
  return {
    id: 'analysis-1',
    analysisVersion: '2026-05-24-llm-transcript-analysis',
    channelId: 'channel-1',
    channelTitle: 'Test Channel',
    channelUrl: 'https://youtube.com/@test',
    analyzedAt: '2026-05-25T00:00:00.000Z',
    videoSampleSize: 2,
    medianViews: 200,
    medianEngagementPer1kViews: 10,
    findings: [],
    experiments: [],
    warnings: [],
    viewWinners: [],
    engagementStandouts: [],
    videos: [
      {
        id: 'video-1',
        title: 'First video',
        url: 'https://youtube.com/watch?v=video-1',
        thumbnailUrl: null,
        publishedAt: null,
        publishedText: null,
        durationSeconds: 300,
        viewCount: 300,
        likeCount: 3,
        commentCount: 1,
        isShort: false,
        transcriptStatus: 'not_requested',
        viewOutlierRatio: 1.5,
        engagementPer1kViews: 10,
        whyFlagged: [],
        contextNotes: [],
      },
      {
        id: 'video-2',
        title: 'Second video',
        url: 'https://youtube.com/watch?v=video-2',
        thumbnailUrl: null,
        publishedAt: null,
        publishedText: null,
        durationSeconds: 280,
        viewCount: 100,
        likeCount: 1,
        commentCount: 0,
        isShort: false,
        transcriptStatus: 'not_requested',
        viewOutlierRatio: 0.5,
        engagementPer1kViews: 10,
        whyFlagged: [],
        contextNotes: [],
      },
    ],
  };
}

test('applyVideoTranscriptAnalysis stores the LLM transcript analysis on the matching video in the snapshot', () => {
  const analysis = buildAnalysis();
  const transcriptAnalysis = buildTranscriptAnalysis();

  const updated = applyVideoTranscriptAnalysis({
    analysis,
    videoId: 'video-1',
    transcriptStatus: 'available',
    transcriptAnalysis,
  });

  assert.equal(updated.videos[0]?.transcriptStatus, 'available');
  assert.deepEqual(updated.videos[0]?.transcriptAnalysis, transcriptAnalysis);
  assert.equal(updated.videos[1]?.transcriptAnalysis, undefined);
});

test('applyVideoTranscriptAnalysis leaves other videos untouched', () => {
  const analysis = buildAnalysis();
  const transcriptAnalysis = buildTranscriptAnalysis();

  const updated = applyVideoTranscriptAnalysis({
    analysis,
    videoId: 'video-2',
    transcriptStatus: 'available',
    transcriptAnalysis,
  });

  assert.equal(updated.videos[0]?.id, 'video-1');
  assert.equal(updated.videos[0]?.transcriptStatus, 'not_requested');
  assert.equal(updated.videos[0]?.transcriptAnalysis, undefined);
});
