import { NextResponse } from 'next/server';

import type { CompareSavedAnalysesRequest, CompareSavedAnalysesResponse } from '@/lib/contracts/api';
import { compareSavedAnalysesSchema } from '@/lib/contracts/schemas';
import { AppError, getStatusCode, toApiFailure } from '@/server/errors';
import { compareSavedAnalyses } from '@/server/analysis/compare';
import { getSavedAnalysis } from '@/server/store/analysis-store';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CompareSavedAnalysesRequest;
    const parsed = compareSavedAnalysesSchema.safeParse(payload);

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid compare request.');
    }

    const [left, right] = await Promise.all([
      getSavedAnalysis(parsed.data.leftAnalysisId),
      getSavedAnalysis(parsed.data.rightAnalysisId),
    ]);

    if (!left || !right) {
      throw new AppError('INVALID_INPUT', 'One or both saved analyses could not be found.');
    }

    const result = compareSavedAnalyses(left, right);
    const response: CompareSavedAnalysesResponse = {
      ok: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
