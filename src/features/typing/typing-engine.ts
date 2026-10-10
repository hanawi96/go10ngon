/**
 * Bộ xử lý văn bản luyện gõ Go10Ngon.
 * Hỗ trợ Unicode, tiếng Việt và ký tự ghép.
 */

// Khởi tạo một lần, tái sử dụng trong toàn bộ ứng dụng.
const segmenter = new Intl.Segmenter('vi', {
  granularity: 'grapheme',
});

/**
 * Chuẩn hóa văn bản về Unicode NFC.
 *
 * Ví dụ: "a" + dấu sắc kết hợp sẽ thành "á".
 */
export function normalizeTypingText(value: string): string {
  return value.normalize('NFC');
}

/**
 * Tách văn bản theo ký tự hiển thị (grapheme).
 *
 * Không sử dụng split('') vì có thể chia sai
 * ký tự tiếng Việt hoặc emoji.
 */
export function splitGraphemes(value: string): string[] {
  const normalized = normalizeTypingText(value);

  return Array.from(
    segmenter.segment(normalized),
    ({ segment }) => segment,
  );
}

/**
 * Giới hạn số ký tự nhập mà không cắt vỡ Unicode.
 */
export function limitTypingText(
  value: string,
  maxCharacters: number,
): string {
  const normalized = normalizeTypingText(value);

  const limit = Math.max(0, Math.trunc(maxCharacters));

  const characters = splitGraphemes(normalized);

  if (characters.length <= limit) {
    return normalized;
  }

  return characters.slice(0, limit).join('');
}

/**
 * Kiểm tra hai văn bản có tương đương Unicode hay không.
 */
export function isTypingTextComplete(
  expected: string,
  actual: string,
): boolean {
  return (
    normalizeTypingText(expected) ===
    normalizeTypingText(actual)
  );
}