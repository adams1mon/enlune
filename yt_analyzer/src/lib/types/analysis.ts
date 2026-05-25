export const ANALYSIS_VERSION = '2026-05-24-llm-transcript-analysis';
export const ANALYSIS_SAMPLE_SIZE = 15;
export const MAX_DEEP_DIVES = 5;

export type TranscriptStatus = 'not_requested' | 'available' | 'unavailable' | 'error';
export type TranscriptAnalysisMethod = 'llm';
export type TranscriptAnalysisProvider = 'openai-compatible';

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

export interface TranscriptAnalysisEvidence {
  timestamp: string | null;
  snippet: string;
  note: string;
}

export interface TranscriptAnalysisDimension {
  score: 1 | 2 | 3 | 4 | 5;
  verdict: string;
  evidence: TranscriptAnalysisEvidence[];
}

export interface TranscriptAnalysisAudienceDimension extends TranscriptAnalysisDimension {
  intendedAudience: string;
  audienceLevel: string;
}

export interface TranscriptAnalysisTimeToValueDimension extends TranscriptAnalysisDimension {
  secondsToValue: number | null;
}

export interface TranscriptAnalysisEntertainmentDimension extends TranscriptAnalysisDimension {
  dominantDrivers: string[];
}

export interface TranscriptAnalysisPackagingDimension extends TranscriptAnalysisDimension {
  visualRead: string;
}

export interface VideoTranscriptAnalysis {
  method: TranscriptAnalysisMethod;
  provider: TranscriptAnalysisProvider;
  model: string;
  analyzedAt: string;
  transcriptCharacters: number;
  transcriptCharactersSent: number;
  transcriptExcerpted: boolean;
  overview: {
    summary: string;
    valueType: string;
  };
  dimensions: {
    valuePropositionClarity: TranscriptAnalysisDimension;
    audienceTargeting: TranscriptAnalysisAudienceDimension;
    timeToValue: TranscriptAnalysisTimeToValueDimension;
    openLoopsRetentionStructure: TranscriptAnalysisDimension;
    payoffDelivery: TranscriptAnalysisDimension;
    pacing: TranscriptAnalysisDimension;
    humorSurpriseTensionConflict: TranscriptAnalysisEntertainmentDimension;
    practicalUtilityDepth: TranscriptAnalysisDimension;
    credibilityQuality: TranscriptAnalysisDimension;
    filler: TranscriptAnalysisDimension;
    repetition: TranscriptAnalysisDimension;
    sponsorIntrusion: TranscriptAnalysisDimension;
    ctaOverload: TranscriptAnalysisDimension;
    titlePromiseVsTranscriptDelivery: TranscriptAnalysisDimension;
    thumbnailTitleComplementarity: TranscriptAnalysisPackagingDimension;
  };
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export interface AnalyzedVideo extends ChannelVideo {
  viewOutlierRatio: number | null;
  engagementPer1kViews: number | null;
  whyFlagged: string[];
  transcriptAnalysis?: VideoTranscriptAnalysis;
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
  medianViews: number | null;
  medianEngagementPer1kViews: number | null;
  findings: string[];
  experiments: string[];
  sourceWarnings?: string[];
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
  aiTranscriptAnalysisCount: number;
  medianViews: number | null;
  topTakeaway: string | null;
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
