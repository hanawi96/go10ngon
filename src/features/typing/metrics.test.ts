import { describe, expect, it } from 'vitest';
import { calculateTypingMetrics } from './metrics';

describe('Typing Metrics', () => {
  it('tính đúng WPM', () => {
    const text = 'a'.repeat(250);

    const result = calculateTypingMetrics(
      text,
      text,
      60000,
    );

    expect(result.wpm).toBe(50);
    expect(result.accuracy).toBe(100);
  });

  it('phát hiện ký tự sai', () => {
    const result = calculateTypingMetrics(
      'abcde',
      'abxde',
      60000,
    );

    expect(result.correctChars).toBe(4);
    expect(result.incorrectChars).toBe(1);
    expect(result.accuracy).toBe(80);
  });

  it('xử lý văn bản rỗng', () => {
    const result = calculateTypingMetrics('', '', 0);

    expect(result.wpm).toBe(0);
    expect(result.accuracy).toBe(0);
  });

  it('nhận diện Unicode tiếng Việt', () => {
    const result = calculateTypingMetrics(
      'á',
      'a\u0301',
      60000,
    );

    expect(result.correctChars).toBe(1);
    expect(result.accuracy).toBe(100);
  });
});