import { NextResponse } from 'next/server';

import type { AnalyzeDirectTranscriptRequest, AnalyzeDirectTranscriptResponse } from '@/tools/youtube-analyzer/lib/contracts/api';
import { analyzeDirectTranscriptSchema } from '@/tools/youtube-analyzer/lib/contracts/schemas';
import { AppError, getStatusCode, toApiFailure } from '@/tools/youtube-analyzer/server/errors';
import { analyzeDirectVideoTranscript } from '@/tools/youtube-analyzer/server/services/analyze-direct-video-transcript';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeDirectTranscriptRequest;
    const parsed = analyzeDirectTranscriptSchema.safeParse(payload);

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid direct transcript request.');
    }

    const result = await analyzeDirectVideoTranscript(parsed.data.videoUrl);
    const response: AnalyzeDirectTranscriptResponse = {
      ok: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
