import { AppError } from '@/server/errors';

const CHANNEL_URL_PATTERN = /youtube\.com\/channel\/(UC[\w-]+)/i;
const HANDLE_URL_PATTERN = /youtube\.com\/@([\w.-]+)/i;
const RAW_HANDLE_PATTERN = /^@([\w.-]+)$/i;

export interface NormalizedChannelRequest {
  kind: 'channel-id' | 'handle';
  value: string;
  sourceUrl: string;
}

export function normalizeChannelInput(channelInput: string): NormalizedChannelRequest {
  const trimmed = channelInput.trim();

  const channelMatch = trimmed.match(CHANNEL_URL_PATTERN);
  if (channelMatch) {
    return {
      kind: 'channel-id',
      value: channelMatch[1],
      sourceUrl: `https://www.youtube.com/channel/${channelMatch[1]}`,
    };
  }

  const handleUrlMatch = trimmed.match(HANDLE_URL_PATTERN);
  if (handleUrlMatch) {
    const handle = `@${handleUrlMatch[1]}`;
    return {
      kind: 'handle',
      value: handle,
      sourceUrl: `https://www.youtube.com/${handle}`,
    };
  }

  const rawHandleMatch = trimmed.match(RAW_HANDLE_PATTERN);
  if (rawHandleMatch) {
    const handle = `@${rawHandleMatch[1]}`;
    return {
      kind: 'handle',
      value: handle,
      sourceUrl: `https://www.youtube.com/${handle}`,
    };
  }

  throw new AppError(
    'INVALID_INPUT',
    'Use a supported YouTube channel input: /channel/UC..., /@handle, or a raw @handle.',
  );
}
