import { z } from 'zod';

const scoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const evidenceSchema = z
  .object({
    timestamp: z.string().trim().min(1).max(32).nullable(),
    snippet: z.string().trim().min(1).max(420),
    note: z.string().trim().min(1).max(320),
  })
  .strict();

const dimensionSchema = z
  .object({
    score: scoreSchema,
    verdict: z.string().trim().min(1).max(520),
    evidence: z.array(evidenceSchema).max(3),
  })
  .strict();

const audienceDimensionSchema = dimensionSchema
  .extend({
    intendedAudience: z.string().trim().min(1).max(220),
    audienceLevel: z.string().trim().min(1).max(160),
  })
  .strict();

const timeToValueDimensionSchema = dimensionSchema
  .extend({
    secondsToValue: z.number().finite().int().min(0).max(24 * 60 * 60).nullable(),
  })
  .strict();

const entertainmentDimensionSchema = dimensionSchema
  .extend({
    dominantDrivers: z.array(z.string().trim().min(1).max(60)).max(4),
  })
  .strict();

const packagingDimensionSchema = dimensionSchema
  .extend({
    visualRead: z.string().trim().min(1).max(320),
  })
  .strict();

export const llmTranscriptAnalysisSchema = z
  .object({
    overview: z
      .object({
        summary: z.string().trim().min(1).max(1400),
        valueType: z.string().trim().min(1).max(140),
      })
      .strict(),
    dimensions: z
      .object({
        valuePropositionClarity: dimensionSchema,
        audienceTargeting: audienceDimensionSchema,
        timeToValue: timeToValueDimensionSchema,
        openLoopsRetentionStructure: dimensionSchema,
        payoffDelivery: dimensionSchema,
        pacing: dimensionSchema,
        humorSurpriseTensionConflict: entertainmentDimensionSchema,
        practicalUtilityDepth: dimensionSchema,
        credibilityQuality: dimensionSchema,
        filler: dimensionSchema,
        repetition: dimensionSchema,
        sponsorIntrusion: dimensionSchema,
        ctaOverload: dimensionSchema,
        titlePromiseVsTranscriptDelivery: dimensionSchema,
        thumbnailTitleComplementarity: packagingDimensionSchema,
      })
      .strict(),
    strengths: z.array(z.string().trim().min(1).max(320)).min(1).max(4),
    risks: z.array(z.string().trim().min(1).max(320)).min(1).max(4),
    recommendations: z.array(z.string().trim().min(1).max(320)).min(1).max(4),
  })
  .strict();

export type ParsedLlmTranscriptAnalysis = z.infer<typeof llmTranscriptAnalysisSchema>;
