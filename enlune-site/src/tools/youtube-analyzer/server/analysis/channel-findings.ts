import type { AnalyzedVideo, ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import { uniqueStrings } from '@/tools/youtube-analyzer/lib/utils';

export function buildChannelFindings(input: {
  analysisBase: Pick<ChannelAnalysis, 'channelTitle' | 'medianViews'>;
  videos: AnalyzedVideo[];
  viewWinners: AnalyzedVideo[];
  engagementStandouts: AnalyzedVideo[];
  warnings: string[];
}) {
  const findings: string[] = [];

  if (input.viewWinners[0]?.viewOutlierRatio != null) {
    findings.push(
      `${input.analysisBase.channelTitle}'s strongest recent view winner reached ${input.viewWinners[0].viewOutlierRatio?.toFixed(1)}x its median views.`,
    );
  }

  if (input.engagementStandouts[0]?.engagementPer1kViews != null) {
    findings.push(
      `Top engagement standout reached ${input.engagementStandouts[0].engagementPer1kViews?.toFixed(1)} likes per 1k views.`,
    );
  }

  return {
    findings: uniqueStrings(findings).slice(0, 5),
    warnings: uniqueStrings([
      ...input.warnings,
      input.analysisBase.medianViews == null ? 'Median views could not be calculated reliably for this sample.' : '',
    ]),
  };
}
