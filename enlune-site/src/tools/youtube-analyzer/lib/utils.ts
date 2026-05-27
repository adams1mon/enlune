export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(0)}%`;
}

export function formatDecimal(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

export function median(values: Array<number | null | undefined>) {
  const filtered = values
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!filtered.length) return null;

  const midpoint = Math.floor(filtered.length / 2);
  if (filtered.length % 2 === 0) {
    return (filtered[midpoint - 1] + filtered[midpoint]) / 2;
  }

  return filtered[midpoint];
}

export function safeRatio(numerator: number | null | undefined, denominator: number | null | undefined) {
  if (numerator == null || denominator == null || denominator <= 0) return null;
  return numerator / denominator;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

export function firstSentence(text: string | null | undefined) {
  if (!text) return null;
  const normalized = normalizeWhitespace(text);
  const match = normalized.match(/.+?[.!?](?:\s|$)/);
  return (match?.[0] ?? normalized).trim();
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','for','with','without','your','you','this','that','from','into','onto','about','after','before','over','under','inside','outside','through','how','why','what','when','where','are','was','were','is','be','to','of','in','on','it','we','they','i','my','our','their','as','at','by','if','than','then','so','too','can','will','just'
]);

export function extractKeywords(texts: string[], limit = 10) {
  const counts = new Map<string, number>();

  for (const text of texts) {
    const tokens = normalizeWhitespace(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
