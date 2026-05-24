import type {
  ChannelAnalysis,
  ChannelCompareResult,
  SavedChannelAnalysisSummary,
} from '@/lib/types/analysis';

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'CHANNEL_NOT_FOUND'
  | 'ANALYSIS_NOT_FOUND'
  | 'YOUTUBE_FETCH_FAILED'
  | 'TRANSCRIPT_FETCH_FAILED'
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

export interface CompareSavedAnalysesRequest {
  leftAnalysisId: string;
  rightAnalysisId: string;
}

export interface SavedAnalysesResponseData {
  analyses: SavedChannelAnalysisSummary[];
  analysis?: ChannelAnalysis | null;
}

export type AnalyzeChannelResponse = ApiResponse<ChannelAnalysis>;
export type CompareSavedAnalysesResponse = ApiResponse<ChannelCompareResult>;
export type SavedAnalysesResponse = ApiResponse<SavedAnalysesResponseData>;
