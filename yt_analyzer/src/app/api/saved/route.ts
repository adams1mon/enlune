import { NextResponse } from 'next/server';

import type { SavedAnalysesResponse } from '@/lib/contracts/api';
import { savedAnalysisQuerySchema } from '@/lib/contracts/schemas';
import { AppError, getStatusCode, toApiFailure } from '@/server/errors';
import { deleteSavedAnalysis, getSavedAnalysis, listSavedAnalyses } from '@/server/store/analysis-store';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = savedAnalysisQuerySchema.safeParse({
      analysisId: url.searchParams.get('analysisId') ?? undefined,
    });

    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', 'Invalid saved-analysis query.');
    }

    const analyses = await listSavedAnalyses();
    const analysis = parsed.data.analysisId ? await getSavedAnalysis(parsed.data.analysisId) : undefined;

    const response: SavedAnalysesResponse = {
      ok: true,
      data: {
        analyses,
        analysis,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = savedAnalysisQuerySchema.safeParse({
      analysisId: url.searchParams.get('analysisId') ?? undefined,
    });

    if (!parsed.success || !parsed.data.analysisId) {
      throw new AppError('INVALID_INPUT', 'Choose a saved analysis to delete.');
    }

    await deleteSavedAnalysis(parsed.data.analysisId);

    const response: SavedAnalysesResponse = {
      ok: true,
      data: {
        analyses: await listSavedAnalyses(),
        analysis: null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: getStatusCode(error) });
  }
}
