import type { AnalyzedVideo } from '@/lib/types/analysis';
import { clamp, median, safeRatio } from '@/lib/utils';

export function computeEngagementPer1kViews(video: { likeCount: number | null; viewCount: number | null }) {
  const ratio = safeRatio(video.likeCount, video.viewCount);
  if (ratio == null) return null;
  return ratio * 1000;
}

function scoreVideosUsingMedians(
  videos: AnalyzedVideo[],
  medianViews: number | null,
  medianEngagementPer1kViews: number | null,
) {
  return videos.map((video) => {
    const viewOutlierRatio = safeRatio(video.viewCount, medianViews);
    const engagementPer1kViews = computeEngagementPer1kViews(video);
    const whyFlagged: string[] = [];

    if (viewOutlierRatio != null && viewOutlierRatio >= 1.25) {
      whyFlagged.push(`${viewOutlierRatio.toFixed(1)}x the channel's median views`);
    }

    if (
      engagementPer1kViews != null &&
      medianEngagementPer1kViews != null &&
      engagementPer1kViews >= medianEngagementPer1kViews * 1.15
    ) {
      whyFlagged.push(`${engagementPer1kViews.toFixed(1)} likes per 1k views`);
    }

    return {
      ...video,
      viewOutlierRatio,
      engagementPer1kViews,
      whyFlagged,
    };
  });
}

export function scoreVideos(videos: AnalyzedVideo[]) {
  const medianViews = median(videos.map((video) => video.viewCount));
  const engagementValues = videos.map((video) => computeEngagementPer1kViews(video));
  const medianEngagementPer1kViews = median(engagementValues);

  const scoredVideos = scoreVideosUsingMedians(videos, medianViews, medianEngagementPer1kViews);

  const viewWinners = [...scoredVideos]
    .filter((video) => video.viewOutlierRatio != null)
    .sort((a, b) => (b.viewOutlierRatio ?? 0) - (a.viewOutlierRatio ?? 0))
    .slice(0, 3);

  const engagementStandouts = [...scoredVideos]
    .filter((video) => video.engagementPer1kViews != null)
    .sort((a, b) => (b.engagementPer1kViews ?? 0) - (a.engagementPer1kViews ?? 0))
    .slice(0, 3);

  const transcriptCandidateIds = Array.from(
    new Set([...viewWinners, ...engagementStandouts].map((video) => video.id)),
  ).slice(0, 5);

  return {
    medianViews,
    medianEngagementPer1kViews,
    scoredVideos,
    viewWinners,
    engagementStandouts,
    transcriptCandidateIds,
  };
}

export function scoreVideosAgainstBaseline(
  videos: AnalyzedVideo[],
  baseline: {
    medianViews: number | null;
    medianEngagementPer1kViews: number | null;
  },
) {
  return scoreVideosUsingMedians(videos, baseline.medianViews, baseline.medianEngagementPer1kViews);
}

export function inferDataQuality(input: {
  transcriptCoverage: number;
  engagementCoverage: number;
  sampleSize: number;
}) {
  const score = clamp(
    input.transcriptCoverage * 0.45 + input.engagementCoverage * 0.35 + Math.min(input.sampleSize / 15, 1) * 0.2,
    0,
    1,
  );

  if (score >= 0.72) return 'strong';
  if (score >= 0.4) return 'mixed';
  return 'weak';
}
