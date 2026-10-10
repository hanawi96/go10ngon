import { describe, expect, it } from 'vitest';
import { normalizeTypingText } from './typing-engine';

describe('normalizeTypingText', () => {
  it('chuẩn hóa ký tự Unicode', () => {
    expect(normalizeTypingText('a\u0301')).toBe('á');
  });
});
