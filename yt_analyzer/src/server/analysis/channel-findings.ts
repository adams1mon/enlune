import type { AnalyzedVideo, ChannelAnalysis } from '@/lib/types/analysis';
import { extractKeywords, uniqueStrings } from '@/lib/utils';

function buildPatternSentences(videos: AnalyzedVideo[]) {
  const titles = videos.map((video) => video.title);
  const keywords = extractKeywords(titles, 5);
  const messages: string[] = [];

  const numericTitles = videos.filter((video) => /\d/.test(video.title)).length;
  if (numericTitles >= Math.max(2, Math.ceil(videos.length / 2))) {
    messages.push('Outlier titles often use numbers, timeframes, or specific promises.');
  }

  if (keywords.length) {
    messages.push(`Repeated winning themes include ${keywords.slice(0, 4).join(', ')}.`);
  }

  return uniqueStrings(messages);
}

export function buildChannelFindings(input: {
  analysisBase: Pick<ChannelAnalysis, 'channelTitle' | 'medianViews'>;
  videos: AnalyzedVideo[];
  viewWinners: AnalyzedVideo[];
  engagementStandouts: AnalyzedVideo[];
  warnings: string[];
}) {
  const findings: string[] = [];
  const experiments: string[] = [];

  if (input.viewWinners[0]?.viewOutlierRatio != null) {
    findings.push(
      `${input.analysisBase.channelTitle}'s strongest recent view winner reached ${input.viewWinners[0].viewOutlierRatio?.toFixed(1)}x its median views.`,
    );
  }

  findings.push(...buildPatternSentences(input.viewWinners));

  if (input.engagementStandouts[0]?.engagementPer1kViews != null) {
    findings.push(
      `Top engagement standout reached ${input.engagementStandouts[0].engagementPer1kViews?.toFixed(1)} likes per 1k views.`,
    );
  }

  const topKeywords = extractKeywords(input.viewWinners.map((video) => video.title), 4);

  if (topKeywords.length) {
    experiments.push(
      `Test more titles that lean into keywords: '${topKeywords.slice(0, 3).join(', ')}'; those themes showed up repeatedly in the view winners.`,
    );
  }

  if (!experiments.length) {
    experiments.push('Keep testing clearer, more outcome-specific titles and compare them against the channel baseline.');
  }

  return {
    findings: uniqueStrings(findings).slice(0, 5),
    experiments: uniqueStrings(experiments).slice(0, 3),
    warnings: uniqueStrings([
      ...input.warnings,
      input.analysisBase.medianViews == null ? 'Median views could not be calculated reliably for this sample.' : '',
    ]),
  };
}
