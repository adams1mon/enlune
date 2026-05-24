import { normalizeWhitespace } from '@/lib/utils';

const KEYWORD_GROUPS: Array<{ label: string; tokens: string[] }> = [
  { label: 'Possible timing factor: holiday or gifting season hook.', tokens: ['christmas', 'holiday', 'gift', 'gifts'] },
  { label: 'Possible timing factor: Black Friday or shopping-season hook.', tokens: ['black friday', 'sale', 'deals'] },
  { label: 'Possible timing factor: New Year / reset framing.', tokens: ['new year', '2026', '2025', 'reset'] },
  { label: 'Possible timing factor: election or news-cycle framing.', tokens: ['election', 'vote', 'debate'] },
  { label: 'Possible timing factor: back-to-school framing.', tokens: ['school', 'college', 'student'] },
  { label: 'Possible timing factor: tax-season framing.', tokens: ['tax', 'irs', 'refund'] },
];

export function buildContextNotes(title: string) {
  const normalized = normalizeWhitespace(title).toLowerCase();
  const notes = KEYWORD_GROUPS.filter((group) =>
    group.tokens.some((token) => normalized.includes(token)),
  ).map((group) => group.label);

  return notes.slice(0, 2);
}
