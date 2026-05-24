import { randomUUID } from 'node:crypto';

import { ANALYSIS_SAMPLE_SIZE, ANALYSIS_VERSION, type AnalyzedVideo, type ChannelAnalysis, type ChannelVideo } from '@/lib/types/analysis';
import { computeEngagementPer1kViews, inferDataQuality, scoreVideos, scoreVideosAgainstBaseline } from '@/server/analysis/outliers';
import { analyzeTranscriptSignals } from '@/server/analysis/transcript-signals';
import { buildContextNotes } from '@/server/analysis/context-notes';
import { buildChannelFindings } from '@/server/analysis/channel-findings';
import { saveChannelAnalysis } from '@/server/store/analysis-store';
import { fetchChannelSnapshot, resolveChannelInput } from '@/server/youtube/client';
import { fetchVideoTranscript } from '@/server/youtube/transcripts';

async function enrichTranscripts(videos: AnalyzedVideo[], candidateIds: string[]) {
  const candidateSet = new Set(candidateIds);
  const updated: AnalyzedVideo[] = [];

  for (const video of videos) {
    const nextVideo: AnalyzedVideo = {
      ...video,
      contextNotes: buildContextNotes(video.title),
    };

    if (!candidateSet.has(video.id)) {
      updated.push(nextVideo);
      continue;
    }

    const transcript = await fetchVideoTranscript(video.id);
    nextVideo.transcriptStatus = transcript.status;

    if (transcript.status === 'available' && transcript.segments.length) {
      nextVideo.transcriptSignals = analyzeTranscriptSignals({
        title: video.title,
        transcriptSegments: transcript.segments,
      });
    }

    updated.push(nextVideo);
  }

  return updated;
}

function toAnalyzedVideos(videos: ChannelVideo[]): AnalyzedVideo[] {
  return videos.map((video) => ({
    ...video,
    viewOutlierRatio: null,
    engagementPer1kViews: computeEngagementPer1kViews(video),
    whyFlagged: [],
    contextNotes: [],
  }));
}

export async function analyzeChannel(channelInput: string, save = true): Promise<ChannelAnalysis> {
  const resolved = await resolveChannelInput(channelInput);
  const snapshot = await fetchChannelSnapshot(resolved);
  const analysisSeedVideos = snapshot.latestVideos.slice(0, ANALYSIS_SAMPLE_SIZE);
  const scoredInitial = scoreVideos(toAnalyzedVideos(analysisSeedVideos));
  const transcriptEnriched = await enrichTranscripts(scoredInitial.scoredVideos, scoredInitial.transcriptCandidateIds);
  const scored = scoreVideos(transcriptEnriched);
  const transcriptById = new Map(transcriptEnriched.map((video) => [video.id, video]));
  const displayVideos = scoreVideosAgainstBaseline(
    toAnalyzedVideos(snapshot.latestVideos).map((video) => {
      const existing = transcriptById.get(video.id);
      if (existing) {
        return existing;
      }

      return {
        ...video,
        contextNotes: buildContextNotes(video.title),
      };
    }),
    {
      medianViews: scored.medianViews,
      medianEngagementPer1kViews: scored.medianEngagementPer1kViews,
    },
  );

  const transcriptCoverage =
    transcriptEnriched.filter((video) => video.transcriptStatus === 'available').length /
    Math.max(transcriptEnriched.length, 1);
  const engagementCoverage =
    transcriptEnriched.filter((video) => video.engagementPer1kViews != null).length /
    Math.max(transcriptEnriched.length, 1);
  const dataQuality = inferDataQuality({
    transcriptCoverage,
    engagementCoverage,
    sampleSize: transcriptEnriched.length,
  });

  const synthesized = buildChannelFindings({
    analysisBase: {
      channelTitle: snapshot.channelTitle,
      medianViews: scored.medianViews,
      transcriptCoverage,
    },
    videos: transcriptEnriched,
    viewWinners: scored.viewWinners,
    engagementStandouts: scored.engagementStandouts,
    dataQuality,
    warnings: snapshot.warnings,
  });

  const analysis: ChannelAnalysis = {
    id: randomUUID(),
    analysisVersion: ANALYSIS_VERSION,
    channelId: snapshot.channelId,
    channelTitle: snapshot.channelTitle,
    channelHandle: snapshot.channelHandle,
    channelUrl: snapshot.channelUrl,
    profileImageUrl: snapshot.profileImageUrl,
    bannerImageUrl: snapshot.bannerImageUrl,
    subscriberCountText: snapshot.subscriberCountText,
    totalVideoCountText: snapshot.totalVideoCountText,
    analyzedAt: new Date().toISOString(),
    videoSampleSize: transcriptEnriched.length,
    transcriptCoverage,
    dataQuality,
    medianViews: scored.medianViews,
    medianEngagementPer1kViews: scored.medianEngagementPer1kViews,
    findings: synthesized.findings,
    experiments: synthesized.experiments,
    warnings: synthesized.warnings,
    viewWinners: scored.viewWinners,
    engagementStandouts: scored.engagementStandouts,
    videos: displayVideos,
  };

  if (save) {
    await saveChannelAnalysis(analysis);
  }

  return analysis;
}
