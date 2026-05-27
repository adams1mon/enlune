import { randomUUID } from 'node:crypto';

import { ANALYSIS_SAMPLE_SIZE, ANALYSIS_VERSION, type AnalyzedVideo, type ChannelAnalysis, type ChannelVideo } from '@/tools/youtube-analyzer/types/analysis';
import { buildChannelFindings } from '@/tools/youtube-analyzer/server/analysis/channel-findings';
import { buildContextNotes } from '@/tools/youtube-analyzer/server/analysis/context-notes';
import { computeEngagementPer1kViews, scoreVideos, scoreVideosAgainstBaseline } from '@/tools/youtube-analyzer/server/analysis/outliers';
import { fetchChannelSnapshot, resolveChannelInput } from '@/tools/youtube-analyzer/server/youtube/client';

const DERIVED_WARNING_MESSAGES = new Set([
  'Median views could not be calculated reliably for this sample.',
]);

function withContextNotes(video: AnalyzedVideo): AnalyzedVideo {
  return {
    ...video,
    contextNotes: buildContextNotes(video.title),
  };
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

function getSourceWarnings(analysis: ChannelAnalysis) {
  return analysis.sourceWarnings ?? analysis.warnings.filter((warning) => !DERIVED_WARNING_MESSAGES.has(warning));
}

function scoreAnalysisVideos(videos: AnalyzedVideo[], videoSampleSize: number) {
  const normalizedVideos = videos.map(withContextNotes);
  const sampleSize = Math.min(videoSampleSize, normalizedVideos.length);
  const sampleVideos = normalizedVideos.slice(0, sampleSize);
  const scoredSample = scoreVideos(sampleVideos);
  const displayVideos = scoreVideosAgainstBaseline(normalizedVideos, {
    medianViews: scoredSample.medianViews,
    medianEngagementPer1kViews: scoredSample.medianEngagementPer1kViews,
  });
  const displayById = new Map(displayVideos.map((video) => [video.id, video]));

  return {
    sampleSize,
    scoredSampleVideos: scoredSample.scoredVideos,
    displayVideos,
    medianViews: scoredSample.medianViews,
    medianEngagementPer1kViews: scoredSample.medianEngagementPer1kViews,
    viewWinners: scoredSample.viewWinners.map((video) => displayById.get(video.id) ?? video),
    engagementStandouts: scoredSample.engagementStandouts.map((video) => displayById.get(video.id) ?? video),
  };
}

export function refreshChannelAnalysis(analysis: ChannelAnalysis, videos = analysis.videos): ChannelAnalysis {
  const sourceWarnings = getSourceWarnings(analysis);
  const scored = scoreAnalysisVideos(videos, analysis.videoSampleSize);
  const synthesized = buildChannelFindings({
    analysisBase: {
      channelTitle: analysis.channelTitle,
      medianViews: scored.medianViews,
    },
    videos: scored.scoredSampleVideos,
    viewWinners: scored.viewWinners,
    engagementStandouts: scored.engagementStandouts,
    warnings: sourceWarnings,
  });

  return {
    ...analysis,
    sourceWarnings,
    videoSampleSize: scored.sampleSize,
    medianViews: scored.medianViews,
    medianEngagementPer1kViews: scored.medianEngagementPer1kViews,
    findings: synthesized.findings,
    warnings: synthesized.warnings,
    viewWinners: scored.viewWinners,
    engagementStandouts: scored.engagementStandouts,
    videos: scored.displayVideos,
  };
}

export async function analyzeChannel(channelInput: string): Promise<ChannelAnalysis> {
  const resolved = await resolveChannelInput(channelInput);
  const snapshot = await fetchChannelSnapshot(resolved);

  return refreshChannelAnalysis({
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
    videoSampleSize: Math.min(ANALYSIS_SAMPLE_SIZE, snapshot.latestVideos.length),
    medianViews: null,
    medianEngagementPer1kViews: null,
    findings: [],
    sourceWarnings: snapshot.warnings,
    warnings: snapshot.warnings,
    viewWinners: [],
    engagementStandouts: [],
    videos: toAnalyzedVideos(snapshot.latestVideos),
  });
}
