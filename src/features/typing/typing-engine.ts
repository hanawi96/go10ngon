export function normalizeTypingText(value: string): string {
  return value.normalize('NFC');
}

export function splitGraphemes(value: string): string[] {
  const normalized = normalizeTypingText(value);

  const segmenter = new Intl.Segmenter('vi', {
    granularity: 'grapheme',
  });

  return Array.from(
    segmenter.segment(normalized),
    (item) => item.segment,
  );
}