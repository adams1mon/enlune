import type {
  AnalyzedVideo,
  ChannelAnalysis,
  SavedChannelAnalysisSummary,
  TranscriptStatus,
  VideoTranscriptAnalysis,
} from '@/tools/youtube-analyzer/types/analysis';

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'CHANNEL_NOT_FOUND'
  | 'ANALYSIS_NOT_FOUND'
  | 'YOUTUBE_FETCH_FAILED'
  | 'TRANSCRIPT_FETCH_FAILED'
  | 'LLM_CONFIG_MISSING'
  | 'LLM_ANALYSIS_FAILED'
  | 'STORE_READ_FAILED'
  | 'STORE_WRITE_FAILED'
  | 'INTERNAL_ERROR';

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: ErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AnalyzeChannelRequest {
  channelInput: string;
  save?: boolean;
}

export interface AnalyzeVideoTranscriptRequest {
  analysis: ChannelAnalysis;
  videoId: string;
}

export interface AnalyzeDirectTranscriptRequest {
  videoUrl: string;
}

export interface DirectTranscriptResult {
  channelTitle: string;
  transcriptStatus: TranscriptStatus;
  transcriptAnalysis: VideoTranscriptAnalysis;
  video: AnalyzedVideo;
}

export interface SavedAnalysesResponseData {
  analyses: SavedChannelAnalysisSummary[];
  analysis?: ChannelAnalysis | null;
}

export type AnalyzeChannelResponse = ApiResponse<ChannelAnalysis>;
export type AnalyzeVideoTranscriptResponse = ApiResponse<ChannelAnalysis>;
export type AnalyzeDirectTranscriptResponse = ApiResponse<DirectTranscriptResult>;
export type SavedAnalysesResponse = ApiResponse<SavedAnalysesResponseData>;
