import type { ApiFailure, ErrorCode } from '@/tools/youtube-analyzer/lib/contracts/api';

const DEFAULT_STATUS_BY_CODE: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  CHANNEL_NOT_FOUND: 404,
  ANALYSIS_NOT_FOUND: 404,
  YOUTUBE_FETCH_FAILED: 502,
  TRANSCRIPT_FETCH_FAILED: 502,
  LLM_CONFIG_MISSING: 503,
  LLM_ANALYSIS_FAILED: 502,
  STORE_READ_FAILED: 500,
  STORE_WRITE_FAILED: 500,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status = DEFAULT_STATUS_BY_CODE[code]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export function toApiFailure(error: unknown): ApiFailure {
  if (error instanceof AppError) {
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  return {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected server error.',
    },
  };
}

export function getStatusCode(error: unknown) {
  if (error instanceof AppError) {
    return error.status;
  }

  return 500;
}
