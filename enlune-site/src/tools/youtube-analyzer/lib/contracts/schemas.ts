import { z } from 'zod';

export const analyzeChannelSchema = z.object({
  channelInput: z.string().trim().min(1, 'Channel input is required.'),
  save: z.boolean().optional(),
});

export const analyzeVideoTranscriptSchema = z.object({
  analysis: z
    .object({
      id: z.string().trim().min(1, 'Analysis id is required.'),
      channelTitle: z.string().trim().min(1, 'Channel title is required.'),
      videos: z.array(z.unknown()).min(1, 'Analysis videos are required.'),
    })
    .passthrough(),
  videoId: z.string().trim().min(1, 'Choose a video to analyze.'),
});

export const analyzeDirectTranscriptSchema = z.object({
  videoUrl: z.string().trim().min(1, 'Paste a YouTube video URL.'),
});

export const savedAnalysisQuerySchema = z.object({
  analysisId: z.string().trim().min(1).optional(),
});

export type AnalyzeChannelInput = z.infer<typeof analyzeChannelSchema>;
export type AnalyzeVideoTranscriptInput = z.infer<typeof analyzeVideoTranscriptSchema>;
export type AnalyzeDirectTranscriptInput = z.infer<typeof analyzeDirectTranscriptSchema>;
export type SavedAnalysisQueryInput = z.infer<typeof savedAnalysisQuerySchema>;
