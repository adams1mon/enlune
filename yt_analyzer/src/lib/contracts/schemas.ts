import { z } from 'zod';

export const analyzeChannelSchema = z.object({
  channelInput: z.string().trim().min(1, 'Channel input is required.'),
  save: z.boolean().optional(),
});

export const analyzeVideoTranscriptSchema = z.object({
  analysisId: z.string().trim().min(1, 'Choose a saved analysis.'),
  videoId: z.string().trim().min(1, 'Choose a video to analyze.'),
});

export const compareSavedAnalysesSchema = z
  .object({
    leftAnalysisId: z.string().trim().min(1, 'Select the left analysis.'),
    rightAnalysisId: z.string().trim().min(1, 'Select the right analysis.'),
  })
  .refine((value) => value.leftAnalysisId !== value.rightAnalysisId, {
    message: 'Choose two different saved analyses to compare.',
    path: ['rightAnalysisId'],
  });

export const savedAnalysisQuerySchema = z.object({
  analysisId: z.string().trim().min(1).optional(),
});

export type AnalyzeChannelInput = z.infer<typeof analyzeChannelSchema>;
export type AnalyzeVideoTranscriptInput = z.infer<typeof analyzeVideoTranscriptSchema>;
export type CompareSavedAnalysesInput = z.infer<typeof compareSavedAnalysesSchema>;
export type SavedAnalysisQueryInput = z.infer<typeof savedAnalysisQuerySchema>;
