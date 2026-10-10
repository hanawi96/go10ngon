export function normalizeTypingText(value: string): string {
  return value.normalize('NFC');
}
