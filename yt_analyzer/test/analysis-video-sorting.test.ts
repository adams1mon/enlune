import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { test } from 'node:test';

import type { AnalyzedVideo } from '../src/lib/types/analysis.ts';

const projectRoot = process.cwd();

type VideoSortKey = 'upload_time' | 'outlier_score' | 'engagement_rate';
type SortAnalyzedVideos = (videos: AnalyzedVideo[], sortBy: VideoSortKey) => AnalyzedVideo[];

function buildVideo(overrides: Partial<AnalyzedVideo> & Pick<AnalyzedVideo, 'id' | 'title'>): AnalyzedVideo {
  return {
    id: overrides.id,
    title: overrides.title,
    url: overrides.url ?? `https://youtube.com/watch?v=${overrides.id}`,
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    publishedAt: overrides.publishedAt ?? null,
    publishedText: overrides.publishedText ?? null,
    durationSeconds: overrides.durationSeconds ?? 300,
    viewCount: overrides.viewCount ?? 1000,
    likeCount: overrides.likeCount ?? 100,
    commentCount: overrides.commentCount ?? null,
    isShort: overrides.isShort ?? false,
    transcriptStatus: overrides.transcriptStatus ?? 'not_requested',
    viewOutlierRatio: overrides.viewOutlierRatio ?? null,
    engagementPer1kViews: overrides.engagementPer1kViews ?? null,
    whyFlagged: overrides.whyFlagged ?? [],
    contextNotes: overrides.contextNotes ?? [],
    transcriptAnalysis: overrides.transcriptAnalysis,
  };
}

test('sortAnalyzedVideos sorts by upload time descending with undated videos last', async () => {
  const modulePath = '../src/lib/analysis-video-sorting.ts';
  const imported = (await import(modulePath)) as { sortAnalyzedVideos: SortAnalyzedVideos };
  const { sortAnalyzedVideos } = imported;

  const videos = [
    buildVideo({ id: 'oldest', title: 'Oldest', publishedAt: '2024-01-01T00:00:00.000Z' }),
    buildVideo({ id: 'undated', title: 'Undated', publishedAt: null }),
    buildVideo({ id: 'newest', title: 'Newest', publishedAt: '2025-02-01T00:00:00.000Z' }),
  ];

  const sorted: AnalyzedVideo[] = sortAnalyzedVideos(videos, 'upload_time');

  assert.deepEqual(
    sorted.map((video) => video.id),
    ['newest', 'oldest', 'undated'],
  );
});

test('sortAnalyzedVideos sorts by outlier score descending with null ratios last', async () => {
  const modulePath = '../src/lib/analysis-video-sorting.ts';
  const imported = (await import(modulePath)) as { sortAnalyzedVideos: SortAnalyzedVideos };
  const { sortAnalyzedVideos } = imported;

  const videos = [
    buildVideo({ id: 'mid', title: 'Mid', viewOutlierRatio: 2.1 }),
    buildVideo({ id: 'missing', title: 'Missing', viewOutlierRatio: null }),
    buildVideo({ id: 'top', title: 'Top', viewOutlierRatio: 5.4 }),
  ];

  const sorted: AnalyzedVideo[] = sortAnalyzedVideos(videos, 'outlier_score');

  assert.deepEqual(
    sorted.map((video) => video.id),
    ['top', 'mid', 'missing'],
  );
});

test('sortAnalyzedVideos sorts by engagement rate descending using likes divided by views', async () => {
  const modulePath = '../src/lib/analysis-video-sorting.ts';
  const imported = (await import(modulePath)) as { sortAnalyzedVideos: SortAnalyzedVideos };
  const { sortAnalyzedVideos } = imported;

  const videos = [
    buildVideo({ id: 'low', title: 'Low', viewCount: 1000, likeCount: 20 }),
    buildVideo({ id: 'high', title: 'High', viewCount: 100, likeCount: 15 }),
    buildVideo({ id: 'missing', title: 'Missing', viewCount: null, likeCount: 5 }),
  ];

  const sorted: AnalyzedVideo[] = sortAnalyzedVideos(videos, 'engagement_rate');

  assert.deepEqual(
    sorted.map((video) => video.id),
    ['high', 'low', 'missing'],
  );
});

test('analysis results UI exposes sort controls for upload time, outlier score, and engagement rate', () => {
  const componentContent = readFileSync(path.join(projectRoot, 'src/components/dashboard/analysis-results.tsx'), 'utf8');
  const sortingContent = readFileSync(path.join(projectRoot, 'src/lib/analysis-video-sorting.ts'), 'utf8');

  assert.ok(componentContent.includes('Sort by'));
  assert.ok(componentContent.includes('analysis-video-sort'));
  assert.ok(sortingContent.includes("label: 'Upload time'"));
  assert.ok(sortingContent.includes("label: 'Outlier score'"));
  assert.ok(sortingContent.includes("label: 'Engagement rate'"));
});
