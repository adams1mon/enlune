import { NextResponse } from 'next/server';

import type { AnalyzeVideoTranscriptRequest, AnalyzeVideoTranscriptResponse } from '@/lib/contracts/api';
import { analyzeVideoTranscriptSchema } from '@/lib/contracts/schemas';
import { AppError, getStatusCode, toApiFailure } from '@/server/errors';
import { analyzeSavedVideoTranscript } from '@/server/services/analyze-video-transcript';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeVideoTranscriptRequest;
    const parsed = analyzeVideoTranscriptSchema.safeParse(payload);

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid transcript analysis request.');
    }

    const analysis = await analyzeSavedVideoTranscript(parsed.data.analysisId, parsed.data.videoId);
    const response: AnalyzeVideoTranscriptResponse = {
      ok: true,
      data: analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
