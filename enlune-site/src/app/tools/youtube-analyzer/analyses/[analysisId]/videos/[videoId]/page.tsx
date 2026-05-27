import { VideoDetailRouteClient } from '@/tools/youtube-analyzer/components/video-detail-route-client';

export default async function YouTubeAnalyzerVideoDetailPage({
  params,
}: {
  params: Promise<{ analysisId: string; videoId: string }>;
}) {
  const { analysisId, videoId } = await params;
  return <VideoDetailRouteClient analysisId={analysisId} videoId={videoId} />;
}
