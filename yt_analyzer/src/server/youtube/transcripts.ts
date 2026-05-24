import { getSubtitles } from 'youtube-caption-extractor';

import type { TranscriptSegment, TranscriptStatus } from '@/lib/types/analysis';
import { normalizeWhitespace } from '@/lib/utils';

const TRANSCRIPT_TIMEOUT_MS = 10_000;

function dedupeSegments(segments: TranscriptSegment[]) {
  const seen = new Set<string>();
  return segments.filter((segment) => {
    const key = `${segment.start}:${normalizeWhitespace(segment.text)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchVideoTranscript(videoId: string): Promise<{
  status: TranscriptStatus;
  segments: TranscriptSegment[];
}> {
  try {
    const subtitles = (await Promise.race([
      getSubtitles({ videoID: videoId, lang: 'en' }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Transcript request timed out.')), TRANSCRIPT_TIMEOUT_MS);
      }),
    ])) as TranscriptSegment[];

    if (!subtitles.length) {
      return { status: 'unavailable', segments: [] };
    }

    return {
      status: 'available',
      segments: dedupeSegments(subtitles).map((segment) => ({
        ...segment,
        text: normalizeWhitespace(segment.text),
      })),
    };
  } catch {
    return {
      status: 'unavailable',
      segments: [],
    };
  }
}
