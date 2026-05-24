import type { ChannelAnalysis } from '@/lib/types/analysis';

export interface AnalysisStoreData {
  schemaVersion: 1;
  analyses: Record<string, ChannelAnalysis>;
}
