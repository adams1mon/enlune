import type { AnalyzedVideo, ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import { applyVideoTranscriptAnalysis } from '@/tools/youtube-analyzer/lib/transcript-analysis-snapshot';
import { AppError } from '@/tools/youtube-analyzer/server/errors';
import { analyzeVideoTranscriptWithLlm } from '@/tools/youtube-analyzer/server/llm/analyze-video-transcript';
import { refreshChannelAnalysis } from '@/tools/youtube-analyzer/server/services/analyze-channel';
import { fetchVideoTranscript } from '@/tools/youtube-analyzer/server/youtube/transcripts';

export async function analyzeVideoTranscript(analysis: ChannelAnalysis, videoId: string): Promise<ChannelAnalysis> {
  const existingVideo = analysis.videos.find((video) => video.id === videoId);

  if (!existingVideo) {
    throw new AppError('INVALID_INPUT', 'That video could not be found in the analysis.');
  }

  const transcript = await fetchVideoTranscript(videoId);

  if (transcript.status !== 'available' || !transcript.segments.length) {
    return refreshChannelAnalysis(
      analysis,
      analysis.videos.map((video) => {
        if (video.id !== videoId) {
          return video;
        }

        const nextVideo: AnalyzedVideo = {
          ...video,
          transcriptStatus: transcript.status,
        };

        delete nextVideo.transcriptAnalysis;
        return nextVideo;
      }),
    );
  }

  const transcriptAnalysis = await analyzeVideoTranscriptWithLlm({
    analysis,
    video: existingVideo,
    transcriptSegments: transcript.segments,
  });

  return refreshChannelAnalysis(
    applyVideoTranscriptAnalysis({
      analysis,
      videoId,
      transcriptStatus: transcript.status,
      transcriptAnalysis,
    }),
  );
}
