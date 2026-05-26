function canonicalizeSecondsString(value: string) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric.toString();
}

function parseClockTimestampToSeconds(value: string) {
  const parts = value.split(':').map((part) => part.trim());

  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  const numericParts = parts.map((part) => Number(part));

  if (numericParts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = numericParts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = numericParts;
  return hours * 3600 + minutes * 60 + seconds;
}

function normalizeTimestampPartToTranscriptSeconds(value: string) {
  const trimmed = value.trim().replace(/^~/, '');

  if (!trimmed) {
    return null;
  }

  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return canonicalizeSecondsString(trimmed);
  }

  if (/^(?:\d+:){1,2}\d+(?:\.\d+)?$/.test(trimmed)) {
    const seconds = parseClockTimestampToSeconds(trimmed);
    return seconds == null ? null : canonicalizeSecondsString(seconds.toString());
  }

  return null;
}

export function normalizeEvidenceTimestampToTranscriptFormat(timestamp: string | null) {
  if (timestamp == null) {
    return null;
  }

  const trimmed = timestamp.trim();

  if (!trimmed) {
    return null;
  }

  const rangeMatch = trimmed.match(/^(.*?)\s*[-–—]\s*(.*?)$/);

  if (rangeMatch) {
    const start = normalizeTimestampPartToTranscriptSeconds(rangeMatch[1] ?? '');
    const end = normalizeTimestampPartToTranscriptSeconds(rangeMatch[2] ?? '');

    if (start && end) {
      return `${start}-${end}`;
    }
  }

  return normalizeTimestampPartToTranscriptSeconds(trimmed) ?? trimmed;
}
