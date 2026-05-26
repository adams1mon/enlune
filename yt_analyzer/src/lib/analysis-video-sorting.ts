import type { AnalyzedVideo } from './types/analysis';

export type AnalysisVideoSortKey = 'upload_time' | 'outlier_score' | 'engagement_rate';

export const ANALYSIS_VIDEO_SORT_OPTIONS: Array<{ value: AnalysisVideoSortKey; label: string }> = [
  { value: 'upload_time', label: 'Upload time' },
  { value: 'outlier_score', label: 'Outlier score' },
  { value: 'engagement_rate', label: 'Engagement rate' },
];

function getUploadTimestamp(video: AnalyzedVideo) {
  if (!video.publishedAt) return null;

  const timestamp = new Date(video.publishedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function compareNullableDescending(left: number | null, right: number | null) {
  if (left != null && right != null && left !== right) {
    return right - left;
  }

  if (left != null && right == null) return -1;
  if (left == null && right != null) return 1;
  return 0;
}

function safeRatioValue(numerator: number | null | undefined, denominator: number | null | undefined) {
  if (numerator == null || denominator == null || denominator <= 0) return null;
  return numerator / denominator;
}

function getSortMetric(video: AnalyzedVideo, sortBy: AnalysisVideoSortKey) {
  if (sortBy === 'upload_time') {
    return getUploadTimestamp(video);
  }

  if (sortBy === 'outlier_score') {
    return video.viewOutlierRatio;
  }

  return safeRatioValue(video.likeCount, video.viewCount);
}

export function sortAnalyzedVideos(videos: AnalyzedVideo[], sortBy: AnalysisVideoSortKey) {
  return [...videos]
    .map((video, index) => ({ video, index }))
    .sort((left, right) => {
      const primaryComparison = compareNullableDescending(getSortMetric(left.video, sortBy), getSortMetric(right.video, sortBy));
      if (primaryComparison !== 0) {
        return primaryComparison;
      }

      const uploadTimeComparison = compareNullableDescending(getUploadTimestamp(left.video), getUploadTimestamp(right.video));
      if (uploadTimeComparison !== 0) {
        return uploadTimeComparison;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.video);
}
