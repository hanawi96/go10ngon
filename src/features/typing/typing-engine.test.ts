import { describe, expect, it } from 'vitest';

import {
  normalizeTypingText,
  splitGraphemes,
  limitTypingText,
  isTypingTextComplete,
} from './typing-engine';

describe('Go10Ngon Typing Engine', () => {
  it('chuẩn hóa ký tự tiếng Việt', () => {
    expect(normalizeTypingText('a\u0301')).toBe('á');
  });

  it('nhận diện đúng ký tự tiếng Việt có dấu', () => {
    const characters = splitGraphemes('Tiếng Việt');

    expect(characters).toEqual([
      'T',
      'i',
      'ế',
      'n',
      'g',
      ' ',
      'V',
      'i',
      'ệ',
      't',
    ]);
  });

  it('không tách rời ký tự và dấu kết hợp', () => {
    const characters = splitGraphemes('a\u0301b');

    expect(characters).toEqual(['á', 'b']);
  });

  it('không tách vỡ emoji phức hợp', () => {
    const characters = splitGraphemes('👨‍👩‍👧‍👦');

    expect(characters).toHaveLength(1);
  });

  it('giới hạn số ký tự chính xác', () => {
    expect(limitTypingText('abcdef', 3)).toBe('abc');
  });

  it('không cắt vỡ Unicode khi giới hạn', () => {
    expect(limitTypingText('a\u0301bc', 1)).toBe('á');
  });

  it('hỗ trợ giới hạn bằng 0', () => {
    expect(limitTypingText('abc', 0)).toBe('');
  });

  it('so sánh hai cách biểu diễn Unicode', () => {
    expect(
      isTypingTextComplete('tiếng', 'tie\u0302\u0301ng'),
    ).toBe(true);
  });

  it('phát hiện nội dung không chính xác', () => {
    expect(
      isTypingTextComplete('gõ đúng', 'gõ sai'),
    ).toBe(false);
  });

  it('xử lý chuỗi rỗng', () => {
    expect(splitGraphemes('')).toEqual([]);
    expect(normalizeTypingText('')).toBe('');
  });
});