import type { ChannelAnalysis, ChannelCompareResult } from '@/lib/types/analysis';
import { extractKeywords, uniqueStrings } from '@/lib/utils';

function titlePatterns(analysis: ChannelAnalysis) {
  return extractKeywords(analysis.viewWinners.map((video) => video.title), 6);
}

function averageViewOutlier(analysis: ChannelAnalysis) {
  const ratios = analysis.viewWinners
    .map((video) => video.viewOutlierRatio)
    .filter((value): value is number => typeof value === 'number');

  if (!ratios.length) return null;
  return ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
}

export function compareSavedAnalyses(left: ChannelAnalysis, right: ChannelAnalysis): ChannelCompareResult {
  const leftPatterns = titlePatterns(left);
  const rightPatterns = titlePatterns(right);
  const overlapPatterns = leftPatterns.filter((pattern) => rightPatterns.includes(pattern)).slice(0, 5);

  const leftAverage = averageViewOutlier(left);
  const rightAverage = averageViewOutlier(right);

  const leftDoesMoreOf = uniqueStrings([
    leftAverage != null && rightAverage != null && leftAverage > rightAverage ? 'Turns standout videos into bigger view outliers.' : '',
    leftPatterns[0] ? `Leans harder on themes like ${leftPatterns.slice(0, 3).join(', ')}.` : '',
  ]).slice(0, 3);

  const rightDoesMoreOf = uniqueStrings([
    rightAverage != null && leftAverage != null && rightAverage > leftAverage ? 'Turns standout videos into bigger view outliers.' : '',
    rightPatterns[0] ? `Leans harder on themes like ${rightPatterns.slice(0, 3).join(', ')}.` : '',
  ]).slice(0, 3);

  const borrowingIdeas = uniqueStrings([
    left.experiments[0] ? `Channel A could test: ${left.experiments[0]}` : '',
    right.experiments[0] ? `Channel B could test: ${right.experiments[0]}` : '',
    overlapPatterns.length ? `Both channels already share patterns around ${overlapPatterns.join(', ')}.` : '',
  ]).slice(0, 4);

  return {
    leftAnalysisId: left.id,
    rightAnalysisId: right.id,
    generatedAt: new Date().toISOString(),
    overlapPatterns,
    leftDoesMoreOf,
    rightDoesMoreOf,
    borrowingIdeas,
    warnings: [],
  };
}
