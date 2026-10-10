import { describe, expect, it } from 'vitest';

import {
  normalizeTypingText,
  splitGraphemes,
  limitTypingText,
  isTypingTextComplete,
  groupTypingTokens,
  nextTypingPageEnd,
  isTypingEditAtEnd,
  isTypingCaretKey,
  shouldSnapTypingCaret,
  readCapsLock,
} from './typing-engine';

describe('Go10Ngon Typing Engine', () => {
  it('chuẩn hóa ký tự tiếng Việt', () => {
    expect(normalizeTypingText('a\u0301')).toBe('á');
  });

  it('nhận diện đúng ký tự tiếng Việt có dấu', () => {
    const characters = splitGraphemes('Tiếng Việt');

    expect(characters).toEqual(['T', 'i', 'ế', 'n', 'g', ' ', 'V', 'i', 'ệ', 't']);
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
    expect(isTypingTextComplete('tiếng', 'tie\u0302\u0301ng')).toBe(true);
  });

  it('phát hiện nội dung không chính xác', () => {
    expect(isTypingTextComplete('gõ đúng', 'gõ sai')).toBe(false);
  });

  it('giữ nguyên từ tiếng Việt khi xuống dòng', () => {
    expect(groupTypingTokens(splitGraphemes('bắt đầu'), 4)).toEqual([
      { kind: 'word', start: 4, characters: ['b', 'ắ', 't'] },
      { kind: 'break', start: 7, characters: [' '] },
      { kind: 'word', start: 8, characters: ['đ', 'ầ', 'u'] },
    ]);
  });

  it('chỉ sang trang sau khi gõ hết trang hiện tại', () => {
    const characters = splitGraphemes('bắt đầu ngay');

    expect(nextTypingPageEnd(characters, 0, 6)).toBe(4);
    expect(characters.slice(0, 4).join('')).toBe('bắt ');
    expect(nextTypingPageEnd(characters, 4, 6)).toBe(8);
    expect(characters.slice(4, 8).join('')).toBe('đầu ');
    expect(nextTypingPageEnd(characters, 8, 6)).toBe(characters.length);
  });

  it('giữ dấu câu đi cùng từ', () => {
    expect(groupTypingTokens(splitGraphemes('phím.'))).toEqual([
      { kind: 'word', start: 0, characters: ['p', 'h', 'í', 'm', '.'] },
    ]);
  });

  it('xử lý chuỗi rỗng', () => {
    expect(splitGraphemes('')).toEqual([]);
    expect(normalizeTypingText('')).toBe('');
  });

  it('chỉ nhận thao tác ở cuối văn bản đang gõ', () => {
    expect(isTypingEditAtEnd('abcd', 4, 4, 'insertText')).toBe(true);
    expect(isTypingEditAtEnd('abcd', 3, 4, 'insertText')).toBe(true);
    expect(isTypingEditAtEnd('abcd', 2, 2, 'insertText')).toBe(false);
    expect(isTypingEditAtEnd('abcd', 4, 4, 'insertFromPaste')).toBe(false);
    expect(isTypingEditAtEnd('abcd', 1, 2, 'insertCompositionText')).toBe(true);
    expect(isTypingCaretKey('ArrowLeft', false)).toBe(true);
    expect(isTypingCaretKey('Backspace', false)).toBe(false);
    expect(isTypingCaretKey('a', true)).toBe(true);
    expect(isTypingCaretKey('a', false)).toBe(false);
  });

  it('cho Telex và VNI sửa nguyên âm trong từ cuối', () => {
    expect(isTypingEditAtEnd('ngay', 2, 3, 'insertText')).toBe(true);
    expect(isTypingEditAtEnd('xin ngay', 6, 7, 'insertReplacementText')).toBe(true);
    expect(isTypingEditAtEnd('xin ngay', 1, 2, 'insertText')).toBe(false);
    expect(isTypingEditAtEnd('ngay', 2, 2, 'deleteContentBackward')).toBe(false);
    expect(shouldSnapTypingCaret('ngay', 4, 4)).toBe(false);
    expect(shouldSnapTypingCaret('ngay', 2, 2)).toBe(true);
    expect(shouldSnapTypingCaret('ngay', 2, 3)).toBe(false);
    expect(shouldSnapTypingCaret('xin ngay', 1, 2)).toBe(true);
  });

  it('nhận biết Caps Lock từ sự kiện bàn phím', () => {
    expect(readCapsLock({ getModifierState: (key) => key === 'CapsLock' })).toBe(true);
    expect(readCapsLock({ getModifierState: (key) => key === 'Shift' })).toBe(false);
    expect(readCapsLock({})).toBe(false);
  });
});
