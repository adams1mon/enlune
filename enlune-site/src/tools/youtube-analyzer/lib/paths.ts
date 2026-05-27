export const YOUTUBE_ANALYZER_ROOT = '/tools/youtube-analyzer';
export const YOUTUBE_ANALYZER_ANALYSES = `${YOUTUBE_ANALYZER_ROOT}/analyses`;
export const YOUTUBE_ANALYZER_TRANSCRIPT = `${YOUTUBE_ANALYZER_ROOT}/transcript`;

export function analysisPath(analysisId: string) {
  return `${YOUTUBE_ANALYZER_ANALYSES}/${analysisId}`;
}

export function videoDetailPath(analysisId: string, videoId: string) {
  return `${analysisPath(analysisId)}/videos/${videoId}`;
}
