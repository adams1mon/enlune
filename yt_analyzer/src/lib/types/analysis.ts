export const ANALYSIS_VERSION = '2026-05-23-mvp';
export const ANALYSIS_SAMPLE_SIZE = 15;
export const MAX_DEEP_DIVES = 5;

export type TranscriptStatus = 'not_requested' | 'available' | 'unavailable' | 'error';
export type TranscriptSignalLevel = 'low' | 'medium' | 'high';
export type DataQuality = 'strong' | 'mixed' | 'weak';

export interface ChannelVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  publishedText: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  isShort: boolean | null;
  transcriptStatus: TranscriptStatus;
}

export interface TranscriptSignalScore {
  level: TranscriptSignalLevel;
  evidence: string[];
}

export interface TranscriptSignalMap {
  hookStrength: TranscriptSignalScore;
  specificityTacticality: TranscriptSignalScore;
  storytelling: TranscriptSignalScore;
  authorityCredibility: TranscriptSignalScore;
  promotionalCtaIntensity: TranscriptSignalScore;
}

export interface AnalyzedVideo extends ChannelVideo {
  viewOutlierRatio: number | null;
  engagementPer1kViews: number | null;
  whyFlagged: string[];
  transcriptSignals?: TranscriptSignalMap;
  contextNotes: string[];
}

export interface ChannelAnalysis {
  id: string;
  analysisVersion: string;
  channelId: string;
  channelTitle: string;
  channelHandle?: string | null;
  channelUrl: string;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  subscriberCountText?: string | null;
  totalVideoCountText?: string | null;
  analyzedAt: string;
  videoSampleSize: number;
  transcriptCoverage: number;
  dataQuality: DataQuality;
  medianViews: number | null;
  medianEngagementPer1kViews: number | null;
  findings: string[];
  experiments: string[];
  warnings: string[];
  viewWinners: AnalyzedVideo[];
  engagementStandouts: AnalyzedVideo[];
  videos: AnalyzedVideo[];
}

export interface SavedChannelAnalysisSummary {
  id: string;
  channelTitle: string;
  channelUrl: string;
  analyzedAt: string;
  videoSampleSize: number;
  transcriptCoverage: number;
  medianViews: number | null;
  topTakeaway: string | null;
  dataQuality: DataQuality;
}

export interface ChannelCompareResult {
  leftAnalysisId: string;
  rightAnalysisId: string;
  generatedAt: string;
  overlapPatterns: string[];
  leftDoesMoreOf: string[];
  rightDoesMoreOf: string[];
  borrowingIdeas: string[];
  warnings: string[];
}

export interface TranscriptSegment {
  start: string;
  dur: string;
  text: string;
}

export interface ResolvedChannelInput {
  rawInput: string;
  normalizedInput: string;
  channelId: string;
  channelUrl: string;
  sourceUrl: string;
}

export interface ChannelSnapshot {
  channelId: string;
  channelTitle: string;
  channelHandle: string | null;
  channelUrl: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  subscriberCountText: string | null;
  totalVideoCountText: string | null;
  latestVideos: ChannelVideo[];
  warnings: string[];
}
