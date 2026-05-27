import { AnalysisDetailRouteClient } from '@/tools/youtube-analyzer/components/analysis-detail-route-client';

export default async function YouTubeAnalyzerAnalysisDetailPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  return <AnalysisDetailRouteClient analysisId={analysisId} />;
}
