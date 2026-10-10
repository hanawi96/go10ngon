import { describe, expect, it } from 'vitest';

import { committedTypingCorrect } from './typing-sound';

describe('Typing sound', () => {
  it('không kêu khi xóa hoặc chuỗi không dài thêm', () => {
    expect(committedTypingCorrect('Mỗi', 'Mỗ', 'Mỗi ngày')).toBeNull();
    expect(committedTypingCorrect('Mỗi', 'Mỗi', 'Mỗi ngày')).toBeNull();
  });

  it('kêu đúng khi ký tự mới khớp', () => {
    expect(committedTypingCorrect('', 'M', 'Mỗi ngày')).toBe(true);
    expect(committedTypingCorrect('M', 'Mỗi', 'Mỗi ngày')).toBe(true);
  });

  it('kêu sai khi có ký tự mới không khớp', () => {
    expect(committedTypingCorrect('M', 'Ma', 'Mỗi ngày')).toBe(false);
    expect(committedTypingCorrect('', 'Ma', 'Mỗi ngày')).toBe(false);
  });
});
