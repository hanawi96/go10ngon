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

  return Array.from(segmenter.segment(normalized), ({ segment }) => segment);
}

export interface TypingToken {
  kind: 'word' | 'break';
  start: number;
  characters: string[];
}

export function isTypingWhitespace(character: string): boolean {
  return /^\s$/u.test(character);
}

// Kết thúc trang ở khoảng trắng, để không cắt giữa một từ.
export function nextTypingPageEnd(characters: string[], start: number, pageSize: number): number {
  const total = characters.length;
  const safeStart = Math.min(Math.max(0, start), total);
  const limit = Math.max(1, Math.trunc(pageSize));
  const hardEnd = Math.min(total, safeStart + limit);

  if (hardEnd >= total) return total;

  let boundary = hardEnd;

  while (boundary > safeStart && !isTypingWhitespace(characters[boundary])) {
    boundary -= 1;
  }

  if (boundary === safeStart) return hardEnd;

  return boundary + 1;
}

// Gom ký tự thành từ để dòng chỉ ngắt ở khoảng trắng.
export function groupTypingTokens(characters: string[], startIndex = 0): TypingToken[] {
  const tokens: TypingToken[] = [];
  let index = 0;

  while (index < characters.length) {
    if (isTypingWhitespace(characters[index])) {
      tokens.push({
        kind: 'break',
        start: startIndex + index,
        characters: [characters[index]],
      });
      index += 1;
      continue;
    }

    const start = startIndex + index;
    const word: string[] = [];

    while (index < characters.length && !isTypingWhitespace(characters[index])) {
      word.push(characters[index]);
      index += 1;
    }

    tokens.push({ kind: 'word', start, characters: word });
  }

  return tokens;
}

/**
 * Giới hạn số ký tự nhập mà không cắt vỡ Unicode.
 */
export function limitTypingText(value: string, maxCharacters: number): string {
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
export function isTypingTextComplete(expected: string, actual: string): boolean {
  return normalizeTypingText(expected) === normalizeTypingText(actual);
}
