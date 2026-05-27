import { NextResponse } from 'next/server';

import type { AnalyzeVideoTranscriptRequest, AnalyzeVideoTranscriptResponse } from '@/tools/youtube-analyzer/lib/contracts/api';
import { analyzeVideoTranscriptSchema } from '@/tools/youtube-analyzer/lib/contracts/schemas';
import type { ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import { AppError, getStatusCode, toApiFailure } from '@/tools/youtube-analyzer/server/errors';
import { analyzeVideoTranscript } from '@/tools/youtube-analyzer/server/services/analyze-video-transcript';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeVideoTranscriptRequest;
    const parsed = analyzeVideoTranscriptSchema.safeParse(payload);

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid transcript analysis request.');
    }

    const analysis = await analyzeVideoTranscript(parsed.data.analysis as unknown as ChannelAnalysis, parsed.data.videoId);
    const response: AnalyzeVideoTranscriptResponse = {
      ok: true,
      data: analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
