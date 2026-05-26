import { normalizeEvidenceTimestampToTranscriptFormat } from '@/lib/transcript-timestamps';
import type { AnalyzedVideo, ChannelAnalysis, TranscriptSegment, VideoTranscriptAnalysis } from '@/lib/types/analysis';
import { normalizeWhitespace, safeRatio } from '@/lib/utils';
import { AppError } from '@/server/errors';
import { llmTranscriptAnalysisSchema, type ParsedLlmTranscriptAnalysis } from '@/server/llm/transcript-analysis-schema';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const MAX_TRANSCRIPT_CHARS = 48000;
const MAX_OUTPUT_TOKENS = 2200;

function getOpenAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new AppError(
      'LLM_CONFIG_MISSING',
      'AI transcript analysis is not configured. Set OPENAI_API_KEY (and optionally OPENAI_MODEL / OPENAI_BASE_URL) before using it.',
    );
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL,
  };
}

function buildTranscriptText(transcriptSegments: TranscriptSegment[]) {
  return transcriptSegments
    .map((segment) => `[${segment.start}] ${normalizeWhitespace(segment.text)}`)
    .filter(Boolean)
    .join('\n');
}

function sliceTranscriptForPrompt(transcriptText: string) {
  if (transcriptText.length <= MAX_TRANSCRIPT_CHARS) {
    return {
      transcriptForPrompt: transcriptText,
      transcriptExcerpted: false,
    };
  }

  const headChars = Math.floor(MAX_TRANSCRIPT_CHARS * 0.58);
  const tailChars = Math.floor(MAX_TRANSCRIPT_CHARS * 0.32);
  const head = transcriptText.slice(0, headChars).trimEnd();
  const tail = transcriptText.slice(-tailChars).trimStart();

  return {
    transcriptForPrompt: `${head}\n\n[... transcript omitted for length ...]\n\n${tail}`,
    transcriptExcerpted: true,
  };
}

function buildPrompt(params: {
  analysis: ChannelAnalysis;
  video: AnalyzedVideo;
  transcriptText: string;
  transcriptExcerpted: boolean;
}) {
  const engagementRate = safeRatio(params.video.likeCount, params.video.viewCount);

  return normalizeWhitespace(`
You are a sharp YouTube content analyst.

Return JSON only.
Be concrete and evidence-based.
Keep every field concise, direct, and specific.
No filler, no hype, no generic advice, no repeated points.
If evidence is uncertain or missing, say so plainly.
Use thumbnail evidence only if a thumbnail image is provided.

Brevity rules:
- overview.summary: 2-4 short sentences max.
- valueType, intendedAudience, audienceLevel, visualRead: short phrases or one tight sentence.
- verdicts and evidence notes: compact and on point.
- strengths, risks, recommendations: 1-4 items each, each item one short sentence.
- evidence: at most 3 items per dimension, only the strongest proof.

Timestamp rules:
- Transcript lines are prefixed with raw second timestamps in brackets, such as [12], [42.5], or [1530].
- When you cite evidence timestamps, use that same raw-seconds format from the transcript.
- Do not convert timestamps into mm:ss or hh:mm:ss.
- If you cite a range, write it in raw seconds, like 12-40 or 3723-3725.5.

Scoring rules:
- Use integer scores from 1 to 5 only.
- For positive dimensions, 1 = very weak / absent and 5 = very strong.
- For friction dimensions (filler, repetition, sponsorIntrusion, ctaOverload), 1 = very low friction and 5 = very high friction.
- Evidence should be specific. Use timestamps when possible. Each evidence item needs timestamp, snippet, and note.

Required dimensions:
- valuePropositionClarity
- audienceTargeting (include intendedAudience and audienceLevel)
- timeToValue (include secondsToValue, or null if uncertain)
- openLoopsRetentionStructure
- payoffDelivery
- pacing
- humorSurpriseTensionConflict (include dominantDrivers chosen from humor, surprise, tension, conflict when relevant)
- practicalUtilityDepth
- credibilityQuality
- filler
- repetition
- sponsorIntrusion
- ctaOverload
- titlePromiseVsTranscriptDelivery
- thumbnailTitleComplementarity (include visualRead)

Video context:
- Channel: ${params.analysis.channelTitle}
- Title: ${params.video.title}
- URL: ${params.video.url}
- Duration seconds: ${params.video.durationSeconds ?? 'unknown'}
- Published: ${params.video.publishedAt ?? params.video.publishedText ?? 'unknown'}
- Views: ${params.video.viewCount ?? 'unknown'}
- Likes: ${params.video.likeCount ?? 'unknown'}
- Comments: ${params.video.commentCount ?? 'unknown'}
- Outlier score: ${params.video.viewOutlierRatio?.toFixed(2) ?? 'unknown'}
- Engagement rate: ${engagementRate != null ? `${(engagementRate * 100).toFixed(2)}%` : 'unknown'}
- Thumbnail URL present: ${params.video.thumbnailUrl ? 'yes' : 'no'}
- Transcript excerpted for length: ${params.transcriptExcerpted ? 'yes' : 'no'}

Transcript:
${params.transcriptText}
  `);
}

async function requestStructuredTranscriptAnalysis(params: {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  thumbnailUrl: string | null;
}) {
  const client = new OpenAI({
    apiKey: params.apiKey,
    baseURL: params.baseUrl,
  });

  return client.chat.completions.parse({
    model: params.model,
    temperature: 0.2,
    max_completion_tokens: MAX_OUTPUT_TOKENS,
    response_format: zodResponseFormat(llmTranscriptAnalysisSchema, 'video_transcript_analysis'),
    messages: [
      {
        role: 'system',
        content:
          'You analyze why YouTube videos work or fall flat. Be concrete, concise, and evidence-led. Never pad fields with filler.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: params.prompt,
          },
          ...(params.thumbnailUrl
            ? [
                {
                  type: 'image_url' as const,
                  image_url: {
                    url: params.thumbnailUrl,
                  },
                },
              ]
            : []),
        ],
      },
    ],
  });
}

function parseStructuredTranscriptAnalysis(completion: Awaited<ReturnType<typeof requestStructuredTranscriptAnalysis>>) {
  const message = completion.choices[0]?.message;

  if (!message) {
    throw new AppError('LLM_ANALYSIS_FAILED', 'The AI transcript analysis returned no message.');
  }

  if (message.refusal) {
    throw new AppError('LLM_ANALYSIS_FAILED', `The AI transcript analysis was refused: ${message.refusal}`);
  }

  if (!message.parsed) {
    throw new AppError('LLM_ANALYSIS_FAILED', 'The AI transcript analysis returned no structured result.');
  }

  try {
    return llmTranscriptAnalysisSchema.parse(message.parsed);
  } catch (error) {
    throw new AppError(
      'LLM_ANALYSIS_FAILED',
      error instanceof Error ? `The AI transcript analysis response was incomplete: ${error.message}` : 'The AI transcript analysis response was incomplete.',
    );
  }
}

function normalizeParsedTranscriptAnalysisTimestamps(parsed: ParsedLlmTranscriptAnalysis): ParsedLlmTranscriptAnalysis {
  return {
    ...parsed,
    dimensions: {
      ...parsed.dimensions,
      valuePropositionClarity: {
        ...parsed.dimensions.valuePropositionClarity,
        evidence: parsed.dimensions.valuePropositionClarity.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      audienceTargeting: {
        ...parsed.dimensions.audienceTargeting,
        evidence: parsed.dimensions.audienceTargeting.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      timeToValue: {
        ...parsed.dimensions.timeToValue,
        evidence: parsed.dimensions.timeToValue.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      openLoopsRetentionStructure: {
        ...parsed.dimensions.openLoopsRetentionStructure,
        evidence: parsed.dimensions.openLoopsRetentionStructure.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      payoffDelivery: {
        ...parsed.dimensions.payoffDelivery,
        evidence: parsed.dimensions.payoffDelivery.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      pacing: {
        ...parsed.dimensions.pacing,
        evidence: parsed.dimensions.pacing.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      humorSurpriseTensionConflict: {
        ...parsed.dimensions.humorSurpriseTensionConflict,
        evidence: parsed.dimensions.humorSurpriseTensionConflict.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      practicalUtilityDepth: {
        ...parsed.dimensions.practicalUtilityDepth,
        evidence: parsed.dimensions.practicalUtilityDepth.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      credibilityQuality: {
        ...parsed.dimensions.credibilityQuality,
        evidence: parsed.dimensions.credibilityQuality.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      filler: {
        ...parsed.dimensions.filler,
        evidence: parsed.dimensions.filler.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      repetition: {
        ...parsed.dimensions.repetition,
        evidence: parsed.dimensions.repetition.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      sponsorIntrusion: {
        ...parsed.dimensions.sponsorIntrusion,
        evidence: parsed.dimensions.sponsorIntrusion.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      ctaOverload: {
        ...parsed.dimensions.ctaOverload,
        evidence: parsed.dimensions.ctaOverload.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      titlePromiseVsTranscriptDelivery: {
        ...parsed.dimensions.titlePromiseVsTranscriptDelivery,
        evidence: parsed.dimensions.titlePromiseVsTranscriptDelivery.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
      thumbnailTitleComplementarity: {
        ...parsed.dimensions.thumbnailTitleComplementarity,
        evidence: parsed.dimensions.thumbnailTitleComplementarity.evidence.map((item) => ({
          ...item,
          timestamp: normalizeEvidenceTimestampToTranscriptFormat(item.timestamp),
        })),
      },
    },
  };
}

export async function analyzeVideoTranscriptWithLlm(params: {
  analysis: ChannelAnalysis;
  video: AnalyzedVideo;
  transcriptSegments: TranscriptSegment[];
}): Promise<VideoTranscriptAnalysis> {
  const config = getOpenAiConfig();
  const transcriptText = buildTranscriptText(params.transcriptSegments);

  if (!transcriptText.trim()) {
    throw new AppError('TRANSCRIPT_FETCH_FAILED', 'A transcript was found, but it was empty after normalization.');
  }

  const { transcriptForPrompt, transcriptExcerpted } = sliceTranscriptForPrompt(transcriptText);
  const prompt = buildPrompt({
    analysis: params.analysis,
    video: params.video,
    transcriptText: transcriptForPrompt,
    transcriptExcerpted,
  });

  let parsed: ParsedLlmTranscriptAnalysis;

  try {
    const completion = await requestStructuredTranscriptAnalysis({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      prompt,
      thumbnailUrl: params.video.thumbnailUrl ?? null,
    });
    parsed = normalizeParsedTranscriptAnalysisTimestamps(parseStructuredTranscriptAnalysis(completion));
  } catch (error) {
    throw new AppError(
      'LLM_ANALYSIS_FAILED',
      error instanceof Error ? `The AI transcript analysis request failed: ${error.message}` : 'The AI transcript analysis request failed.',
    );
  }

  return {
    method: 'llm',
    provider: 'openai-compatible',
    model: config.model,
    analyzedAt: new Date().toISOString(),
    transcriptCharacters: transcriptText.length,
    transcriptCharactersSent: transcriptForPrompt.length,
    transcriptExcerpted,
    overview: parsed.overview,
    dimensions: parsed.dimensions,
    strengths: parsed.strengths,
    risks: parsed.risks,
    recommendations: parsed.recommendations,
  };
}
