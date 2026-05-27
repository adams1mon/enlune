import { Innertube } from 'youtubei.js';

import { ANALYSIS_VERSION, type AnalyzedVideo, type ChannelAnalysis } from '@/tools/youtube-analyzer/types/analysis';
import type { DirectTranscriptResult } from '@/tools/youtube-analyzer/lib/contracts/api';
import { computeEngagementPer1kViews } from '@/tools/youtube-analyzer/server/analysis/outliers';
import { AppError } from '@/tools/youtube-analyzer/server/errors';
import { analyzeVideoTranscriptWithLlm } from '@/tools/youtube-analyzer/server/llm/analyze-video-transcript';
import { fetchVideoTranscript } from '@/tools/youtube-analyzer/server/youtube/transcripts';

function extractVideoId(input: string) {
  const value = input.trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname === 'youtu.be') {
      const candidate = url.pathname.replace(/^\//, '');
      return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
    }

    const fromQuery = url.searchParams.get('v');
    if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) {
      return fromQuery;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const shortCandidate = parts.at(-1) ?? '';
    if (['shorts', 'embed', 'live'].includes(parts[0] ?? '') && /^[a-zA-Z0-9_-]{11}$/.test(shortCandidate)) {
      return shortCandidate;
    }
  } catch {
    return null;
  }

  return null;
}

function normalizePublishedAt(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

function coerceNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function extractThumbnailUrl(value: unknown) {
  if (!Array.isArray(value) || !value.length) return null;

  const first = value[0];
  if (!first || typeof first !== 'object' || !("url" in first)) return null;

  const url = (first as { url?: unknown }).url;
  return typeof url === 'string' ? url : null;
}

function buildSyntheticAnalysis(videoId: string, basicInfo: Record<string, unknown>): { analysis: ChannelAnalysis; video: AnalyzedVideo } {
  const viewCount = coerceNumber(basicInfo.view_count);
  const likeCount = coerceNumber(basicInfo.like_count);
  const durationSeconds = coerceNumber(basicInfo.duration);
  const channelTitle =
    (typeof basicInfo.channel_name === 'string' && basicInfo.channel_name) ||
    (typeof basicInfo.author === 'string' && basicInfo.author) ||
    'Unknown channel';
  const title = (typeof basicInfo.title === 'string' && basicInfo.title) || 'Untitled video';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const video: AnalyzedVideo = {
    id: videoId,
    title,
    url: videoUrl,
    thumbnailUrl: extractThumbnailUrl(basicInfo.thumbnail),
    publishedAt: normalizePublishedAt(basicInfo.publish_date) ?? null,
    publishedText: (typeof basicInfo.published === 'string' && basicInfo.published) || null,
    durationSeconds,
    viewCount,
    likeCount,
    commentCount: coerceNumber(basicInfo.comment_count),
    isShort: durationSeconds != null ? durationSeconds <= 180 : null,
    transcriptStatus: 'not_requested',
    viewOutlierRatio: null,
    engagementPer1kViews: computeEngagementPer1kViews({ likeCount, viewCount } as { likeCount: number | null; viewCount: number | null }),
    whyFlagged: [],
    contextNotes: [],
  };

  const analysis: ChannelAnalysis = {
    id: `direct-${videoId}`,
    analysisVersion: ANALYSIS_VERSION,
    channelId: (typeof basicInfo.channel_id === 'string' && basicInfo.channel_id) || `direct-${videoId}`,
    channelTitle,
    channelHandle: null,
    channelUrl: (typeof basicInfo.channel_url === 'string' && basicInfo.channel_url) || videoUrl,
    profileImageUrl: null,
    bannerImageUrl: null,
    subscriberCountText: null,
    totalVideoCountText: null,
    analyzedAt: new Date().toISOString(),
    videoSampleSize: 1,
    medianViews: viewCount,
    medianEngagementPer1kViews: video.engagementPer1kViews,
    findings: [],
    sourceWarnings: [],
    warnings: [],
    viewWinners: [video],
    engagementStandouts: [video],
    videos: [video],
  };

  return { analysis, video };
}

export async function analyzeDirectVideoTranscript(videoUrl: string): Promise<DirectTranscriptResult> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new AppError('INVALID_INPUT', 'Paste a valid YouTube video URL.');
  }

  const client = await Innertube.create();
  let basicInfo: Record<string, unknown>;

  try {
    const info = await client.getInfo(videoId);
    basicInfo = (info?.basic_info ?? {}) as Record<string, unknown>;
  } catch {
    throw new AppError('YOUTUBE_FETCH_FAILED', 'Unable to load that YouTube video right now.');
  }

  const { analysis, video } = buildSyntheticAnalysis(videoId, basicInfo);
  const transcript = await fetchVideoTranscript(videoId);

  if (transcript.status !== 'available' || !transcript.segments.length) {
    throw new AppError('TRANSCRIPT_FETCH_FAILED', 'No transcript was available for that video.');
  }

  const transcriptAnalysis = await analyzeVideoTranscriptWithLlm({
    analysis,
    video,
    transcriptSegments: transcript.segments,
  });

  return {
    channelTitle: analysis.channelTitle,
    transcriptStatus: transcript.status,
    transcriptAnalysis,
    video: {
      ...video,
      transcriptStatus: transcript.status,
      transcriptAnalysis,
    },
  };
}
