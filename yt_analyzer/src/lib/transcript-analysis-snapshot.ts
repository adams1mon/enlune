import type { ChannelAnalysis, TranscriptStatus, VideoTranscriptAnalysis } from './types/analysis.ts';

export function applyVideoTranscriptAnalysis(input: {
  analysis: ChannelAnalysis;
  videoId: string;
  transcriptStatus: TranscriptStatus;
  transcriptAnalysis: VideoTranscriptAnalysis;
}): ChannelAnalysis {
  return {
    ...input.analysis,
    videos: input.analysis.videos.map((video) => {
      if (video.id !== input.videoId) {
        return video;
      }

      return {
        ...video,
        transcriptStatus: input.transcriptStatus,
        transcriptAnalysis: input.transcriptAnalysis,
      };
    }),
  };
}
