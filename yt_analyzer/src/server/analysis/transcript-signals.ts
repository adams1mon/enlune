import type { TranscriptSegment, TranscriptSignalLevel, TranscriptSignalMap } from '@/lib/types/analysis';
import { normalizeWhitespace } from '@/lib/utils';

function levelFromScore(score: number): TranscriptSignalLevel {
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function pickEvidence(source: string, phrases: string[], limit = 2) {
  const evidence: string[] = [];
  for (const phrase of phrases) {
    if (source.includes(phrase)) {
      evidence.push(`Matched "${phrase}"`);
    }
    if (evidence.length >= limit) break;
  }
  return evidence;
}

export function analyzeTranscriptSignals(params: {
  title: string;
  transcriptSegments: TranscriptSegment[];
}): TranscriptSignalMap {
  const transcriptText = normalizeWhitespace(params.transcriptSegments.map((segment) => segment.text).join(' ')).toLowerCase();
  const openingText = transcriptText.slice(0, 700);
  const normalizedTitle = normalizeWhitespace(params.title).toLowerCase();
  const combined = `${normalizedTitle} ${transcriptText}`;

  const hookPhrases = ['today', 'watch', 'first', 'last', 'survive', 'win', 'challenge', 'only', 'before'];
  const specificPhrases = ['days', 'hours', 'minutes', '$', 'percent', 'step', 'how to', 'exactly'];
  const storyPhrases = ['then', 'after', 'before', 'finally', 'ended up', 'because', 'but', 'until'];
  const authorityPhrases = ['tested', 'results', 'data', 'research', 'proof', 'found out', 'measured'];
  const ctaPhrases = ['subscribe', 'comment', 'like this video', 'click the link', 'buy now'];

  const hookScore = pickEvidence(`${normalizedTitle} ${openingText}`, hookPhrases).length + (/\d/.test(normalizedTitle) ? 1 : 0);
  const specificityScore = pickEvidence(combined, specificPhrases).length + (combined.match(/\d+/g)?.length ?? 0 >= 2 ? 1 : 0);
  const storyScore = pickEvidence(transcriptText, storyPhrases, 3).length;
  const authorityScore = pickEvidence(combined, authorityPhrases).length;
  const ctaScore = pickEvidence(transcriptText, ctaPhrases).length;

  return {
    hookStrength: {
      level: levelFromScore(hookScore),
      evidence: pickEvidence(`${normalizedTitle} ${openingText}`, hookPhrases),
    },
    specificityTacticality: {
      level: levelFromScore(specificityScore),
      evidence: pickEvidence(combined, specificPhrases),
    },
    storytelling: {
      level: levelFromScore(storyScore),
      evidence: pickEvidence(transcriptText, storyPhrases, 3),
    },
    authorityCredibility: {
      level: levelFromScore(authorityScore),
      evidence: pickEvidence(combined, authorityPhrases),
    },
    promotionalCtaIntensity: {
      level: levelFromScore(ctaScore),
      evidence: pickEvidence(transcriptText, ctaPhrases),
    },
  };
}
