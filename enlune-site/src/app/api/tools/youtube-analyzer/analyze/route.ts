import { NextResponse } from 'next/server';

import type { AnalyzeChannelRequest, AnalyzeChannelResponse } from '@/tools/youtube-analyzer/lib/contracts/api';
import { analyzeChannelSchema } from '@/tools/youtube-analyzer/lib/contracts/schemas';
import { AppError, getStatusCode, toApiFailure } from '@/tools/youtube-analyzer/server/errors';
import { analyzeChannel } from '@/tools/youtube-analyzer/server/services/analyze-channel';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeChannelRequest;
    const parsed = analyzeChannelSchema.safeParse(payload);

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid analysis request.');
    }

    const analysis = await analyzeChannel(parsed.data.channelInput);
    const response: AnalyzeChannelResponse = {
      ok: true,
      data: analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
