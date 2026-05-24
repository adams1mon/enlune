import { subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { Innertube } from 'youtubei.js';

import { ANALYSIS_SAMPLE_SIZE, type ChannelSnapshot, type ChannelVideo, type ResolvedChannelInput } from '@/lib/types/analysis';
import { normalizeWhitespace } from '@/lib/utils';
import { AppError } from '@/server/errors';
import { normalizeChannelInput } from '@/server/youtube/normalize';

const DISPLAY_VIDEO_LIMIT = ANALYSIS_SAMPLE_SIZE * 2;

let youtubeClientPromise: Promise<Innertube> | null = null;

type DurationBadge = { text?: string | null };
type ContentImage = {
  image?: Array<{ url?: string | null }>;
  overlays?: Array<{ badges?: DurationBadge[] }>;
};
type MetadataPart = { text?: { text?: string | null } };
type MetadataRow = { metadata_parts?: MetadataPart[] };
type Lockup = {
  content_type?: string;
  content_id?: string;
  metadata?: {
    title?: { text?: string | null };
    metadata?: { metadata_rows?: MetadataRow[] };
  };
  content_image?: ContentImage;
};
type ChannelVideosTab = {
  current_tab?: {
    content?: {
      contents?: Array<{ content?: unknown }>;
    };
  };
};
type HeaderImage = { url?: string | null; width?: number | null; height?: number | null };
type HeaderMetadataPart = { text?: { text?: string | null } | null };
type HeaderMetadataRow = { metadata_parts?: HeaderMetadataPart[] | null };
type ChannelHeaderContent = {
  image?: {
    avatar?: {
      image?: HeaderImage[] | null;
    } | null;
  } | null;
  banner?: {
    image?: HeaderImage[] | null;
  } | null;
  metadata?: {
    metadata_rows?: HeaderMetadataRow[] | null;
  } | null;
};

function getYouTubeClient() {
  if (!youtubeClientPromise) {
    youtubeClientPromise = Innertube.create();
  }

  return youtubeClientPromise;
}

function parseDurationToSeconds(value: string | null | undefined) {
  if (!value) return null;
  const parts = value.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parseCompactMetricCount(text: string | null | undefined) {
  if (!text) return null;
  const normalized = text.toLowerCase().replace(/,/g, '').trim();
  const match = normalized.match(/([\d.]+)\s*([kmb])?/i);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  const multiplier = match[2]?.toLowerCase();
  if (multiplier === 'k') return Math.round(value * 1_000);
  if (multiplier === 'm') return Math.round(value * 1_000_000);
  if (multiplier === 'b') return Math.round(value * 1_000_000_000);
  return Math.round(value);
}

function parseRelativePublishedAt(text: string | null | undefined) {
  if (!text) return null;
  const match = text.toLowerCase().match(/(\d+)\s+(day|week|month|year)s?\s+ago/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  if (Number.isNaN(value)) return null;

  const unit = match[2];
  const now = new Date();

  if (unit === 'day') return subDays(now, value).toISOString();
  if (unit === 'week') return subWeeks(now, value).toISOString();
  if (unit === 'month') return subMonths(now, value).toISOString();
  if (unit === 'year') return subYears(now, value).toISOString();
  return null;
}

function parseDurationBadge(contentImage: ContentImage | null | undefined) {
  const overlays = contentImage?.overlays ?? [];
  for (const overlay of overlays) {
    const badges = overlay?.badges ?? [];
    for (const badge of badges) {
      const duration = parseDurationToSeconds(badge?.text);
      if (duration != null) return duration;
    }
  }
  return null;
}

function extractMetadataParts(lockup: Lockup) {
  const rows = lockup?.metadata?.metadata?.metadata_rows ?? [];
  const parts: string[] = [];

  for (const row of rows) {
    for (const part of row?.metadata_parts ?? []) {
      const text = part?.text?.text;
      if (text) parts.push(text);
    }
  }

  return parts;
}

function extractHeaderMetadataParts(content: ChannelHeaderContent | null | undefined) {
  return (content?.metadata?.metadata_rows ?? []).map((row) =>
    (row?.metadata_parts ?? []).map((part) => normalizeWhitespace(part?.text?.text ?? '')).filter(Boolean),
  );
}

function pickLargestImage(images: HeaderImage[] | null | undefined) {
  if (!images?.length) return null;

  return [...images].sort(
    (left, right) => (right.width ?? 0) * (right.height ?? 0) - (left.width ?? 0) * (left.height ?? 0),
  )[0]?.url ?? null;
}

function extractCommentCountText(info: {
  comments_entry_point_header?: { comment_count?: { toString?: () => string } | null } | null;
}) {
  return info.comments_entry_point_header?.comment_count?.toString?.() ?? null;
}

function buildChannelVideo(lockup: Lockup | null | undefined): ChannelVideo | null {
  if (!lockup || lockup.content_type !== 'VIDEO' || !lockup.content_id) {
    return null;
  }

  const metadataParts = extractMetadataParts(lockup);
  const title = normalizeWhitespace(lockup.metadata?.title?.text ?? 'Untitled video');
  const viewText = metadataParts.find((part) => /views?/i.test(part)) ?? null;
  const publishedText = metadataParts.find((part) => /ago$/i.test(part) || /streamed/i.test(part)) ?? null;
  const durationSeconds = parseDurationBadge(lockup.content_image);

  return {
    id: lockup.content_id,
    title,
    url: `https://www.youtube.com/watch?v=${lockup.content_id}`,
    thumbnailUrl: lockup.content_image?.image?.[0]?.url ?? null,
    publishedAt: parseRelativePublishedAt(publishedText),
    publishedText,
    durationSeconds,
    viewCount: parseCompactMetricCount(viewText),
    likeCount: null,
    commentCount: null,
    isShort: durationSeconds != null ? durationSeconds <= 180 : null,
    transcriptStatus: 'not_requested',
  };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;

  async function consume() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => consume()));
  return results;
}

function isContentItem(value: unknown): value is { content?: unknown } {
  return typeof value === 'object' && value !== null;
}

function isLockup(value: unknown): value is Lockup {
  return typeof value === 'object' && value !== null;
}

function getChannelVideosTab(value: unknown): ChannelVideosTab {
  return (value as ChannelVideosTab) ?? {};
}

async function enrichVideoStats(client: Innertube, video: ChannelVideo): Promise<ChannelVideo> {
  try {
    const info = await client.getInfo(video.id);
    const commentCount = parseCompactMetricCount(extractCommentCountText(info));

    return {
      ...video,
      durationSeconds: info.basic_info.duration ?? video.durationSeconds,
      viewCount: info.basic_info.view_count ?? video.viewCount,
      likeCount: info.basic_info.like_count ?? null,
      commentCount,
      isShort: (info.basic_info.duration ?? video.durationSeconds ?? 0) <= 180,
    };
  } catch {
    return video;
  }
}

function extractVideoLockups(channelVideosTab: ChannelVideosTab) {
  const contents = channelVideosTab?.current_tab?.content?.contents ?? [];
  return contents
    .map((item) => (isContentItem(item) ? item.content : null))
    .filter(Boolean)
    .map((lockup) => buildChannelVideo(isLockup(lockup) ? lockup : null))
    .filter((video: ChannelVideo | null): video is ChannelVideo => Boolean(video));
}

export async function resolveChannelInput(channelInput: string): Promise<ResolvedChannelInput> {
  const normalized = normalizeChannelInput(channelInput);

  if (normalized.kind === 'channel-id') {
    return {
      rawInput: channelInput,
      normalizedInput: normalized.value,
      channelId: normalized.value,
      channelUrl: normalized.sourceUrl,
      sourceUrl: normalized.sourceUrl,
    };
  }

  try {
    const client = await getYouTubeClient();
    const resolved = (await client.resolveURL(normalized.sourceUrl)) as {
      payload?: { browseId?: string };
    };
    const channelId = resolved?.payload?.browseId;

    if (!channelId) {
      throw new AppError('CHANNEL_NOT_FOUND', 'Could not resolve that YouTube channel.');
    }

    return {
      rawInput: channelInput,
      normalizedInput: normalized.value,
      channelId,
      channelUrl: normalized.sourceUrl,
      sourceUrl: normalized.sourceUrl,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('CHANNEL_NOT_FOUND', 'Could not resolve that YouTube channel.');
  }
}

export async function fetchChannelSnapshot(resolved: ResolvedChannelInput): Promise<ChannelSnapshot> {
  const client = await getYouTubeClient();

  try {
    const channel = await client.getChannel(resolved.channelId);
    const headerContent = ((channel.header as { content?: ChannelHeaderContent } | null)?.content ?? null) as ChannelHeaderContent | null;
    const headerMetadataParts = extractHeaderMetadataParts(headerContent);
    const channelHandle = headerMetadataParts[0]?.[0] ?? null;
    const secondRowParts = headerMetadataParts[1] ?? [];
    const subscriberCountText = secondRowParts.find((part) => /subscriber/i.test(part)) ?? null;
    const totalVideoCountText = secondRowParts.find((part) => /video/i.test(part)) ?? null;
    const profileImageUrl =
      pickLargestImage(headerContent?.image?.avatar?.image) ??
      pickLargestImage(channel.metadata?.avatar as HeaderImage[] | null | undefined) ??
      null;
    const bannerImageUrl = pickLargestImage(headerContent?.banner?.image) ?? null;
    const videosTab = await channel.getVideos();
    const listedVideos = extractVideoLockups(getChannelVideosTab(videosTab)).slice(0, DISPLAY_VIDEO_LIMIT);

    if (!listedVideos.length) {
      throw new AppError('YOUTUBE_FETCH_FAILED', 'The channel videos feed did not return any usable videos.');
    }

    const enriched = await mapWithConcurrency(listedVideos, 3, (video) => enrichVideoStats(client, video));

    const warnings: string[] = [];
    const nonShortVideos = enriched.filter((video) => video.isShort !== true);
    const displayVideos = (nonShortVideos.length >= DISPLAY_VIDEO_LIMIT ? nonShortVideos : enriched).slice(0, DISPLAY_VIDEO_LIMIT);
    const analysisVideos = displayVideos.slice(0, ANALYSIS_SAMPLE_SIZE);

    if (analysisVideos.some((video) => video.isShort === true)) {
      warnings.push('Shorts could not be cleanly excluded from the full sample, so some baselines may be skewed.');
    }

    if (!analysisVideos.some((video) => video.likeCount != null)) {
      warnings.push('Like counts were not available consistently, so engagement standings may be limited.');
    }

    if (!displayVideos.some((video) => video.commentCount != null)) {
      warnings.push('Comment counts were not available consistently, so comment-rate badges may show as unavailable.');
    }

    return {
      channelId: channel.metadata?.external_id ?? resolved.channelId,
      channelTitle: channel.metadata?.title ?? 'Unknown channel',
      channelHandle,
      channelUrl: channel.metadata?.url_canonical ?? channel.metadata?.url ?? resolved.channelUrl,
      profileImageUrl,
      bannerImageUrl,
      subscriberCountText,
      totalVideoCountText,
      latestVideos: displayVideos,
      warnings,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('YOUTUBE_FETCH_FAILED', 'Unable to fetch channel data from YouTube right now.');
  }
}
