import type { AnalyzedVideo, ChannelAnalysis } from '@/lib/types/analysis';
import { AppError } from '@/server/errors';
import { analyzeVideoTranscriptWithLlm } from '@/server/llm/analyze-video-transcript';
import { refreshChannelAnalysis } from '@/server/services/analyze-channel';
import { getSavedAnalysis, saveChannelAnalysis } from '@/server/store/analysis-store';
import { fetchVideoTranscript } from '@/server/youtube/transcripts';

export async function analyzeSavedVideoTranscript(analysisId: string, videoId: string): Promise<ChannelAnalysis> {
  const analysis = await getSavedAnalysis(analysisId);

  if (!analysis) {
    throw new AppError('ANALYSIS_NOT_FOUND', 'That saved analysis could not be found.');
  }

  const existingVideo = analysis.videos.find((video) => video.id === videoId);

  if (!existingVideo) {
    throw new AppError('INVALID_INPUT', 'That video could not be found in the saved analysis.');
  }

  const transcript = await fetchVideoTranscript(videoId);

  if (transcript.status !== 'available' || !transcript.segments.length) {
    const unavailableAnalysis = refreshChannelAnalysis(
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

    await saveChannelAnalysis(unavailableAnalysis);
    return unavailableAnalysis;
  }

  const transcriptAnalysis = await analyzeVideoTranscriptWithLlm({
    analysis,
    video: existingVideo,
    transcriptSegments: transcript.segments,
  });

  const updatedAnalysis = refreshChannelAnalysis(
    analysis,
    analysis.videos.map((video) => {
      if (video.id !== videoId) {
        return video;
      }

      const nextVideo: AnalyzedVideo = {
        ...video,
        transcriptStatus: transcript.status,
        transcriptAnalysis,
      };

      return nextVideo;
    }),
  );

  await saveChannelAnalysis(updatedAnalysis);

  return updatedAnalysis;
}
