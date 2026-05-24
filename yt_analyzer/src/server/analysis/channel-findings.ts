import type { AnalyzedVideo, ChannelAnalysis, DataQuality, TranscriptSignalMap } from '@/lib/types/analysis';
import { extractKeywords, uniqueStrings } from '@/lib/utils';

function countHighSignals(videos: AnalyzedVideo[], key: keyof TranscriptSignalMap) {
  return videos.filter((video) => video.transcriptSignals?.[key]?.level === 'high').length;
}

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

  if (countHighSignals(videos, 'hookStrength') >= 2) {
    messages.push('The strongest videos usually get to the hook quickly instead of easing in slowly.');
  }

  if (countHighSignals(videos, 'specificityTacticality') >= 2) {
    messages.push('Concrete promises and specific outcomes appear more often in the winners than vague framing.');
  }

  return uniqueStrings(messages);
}

export function buildChannelFindings(input: {
  analysisBase: Pick<ChannelAnalysis, 'channelTitle' | 'medianViews' | 'transcriptCoverage'>;
  videos: AnalyzedVideo[];
  viewWinners: AnalyzedVideo[];
  engagementStandouts: AnalyzedVideo[];
  dataQuality: DataQuality;
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

  if (input.dataQuality === 'weak') {
    findings.push('Evidence quality is limited here, so treat the takeaways as directional rather than decisive.');
  }

  const topKeywords = extractKeywords(input.viewWinners.map((video) => video.title), 4);

  if (topKeywords.length) {
    experiments.push(
      `Test more titles that lean into ${topKeywords.slice(0, 3).join(', ')}; those themes showed up repeatedly in the view winners.`,
    );
  }

  if (countHighSignals(input.viewWinners, 'hookStrength') >= 2) {
    experiments.push('Open future videos faster with the core tension or payoff instead of spending the first beats on setup.');
  }

  if (countHighSignals(input.viewWinners, 'specificityTacticality') >= 2) {
    experiments.push('Try packaging videos around a more specific promise, outcome, or timeframe instead of a broad topic label.');
  }

  if (!experiments.length) {
    experiments.push('Keep testing clearer, more outcome-specific titles and compare them against the channel baseline.');
  }

  return {
    findings: uniqueStrings(findings).slice(0, input.dataQuality === 'weak' ? 3 : 5),
    experiments: uniqueStrings(experiments).slice(0, input.dataQuality === 'weak' ? 2 : 3),
    warnings: uniqueStrings([
      ...input.warnings,
      input.analysisBase.transcriptCoverage < 0.34 ? 'Transcript coverage is low, so transcript-backed findings are limited.' : '',
      input.analysisBase.medianViews == null ? 'Median views could not be calculated reliably for this sample.' : '',
    ]),
  };
}
