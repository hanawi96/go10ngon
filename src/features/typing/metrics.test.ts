import { describe, expect, it } from 'vitest';
import { calculateTypingMetrics } from './metrics';

describe('Typing Metrics', () => {
  it('tính đúng WPM', () => {
    const text = 'a'.repeat(250);

    const result = calculateTypingMetrics(text, text, 60000);

    expect(result.wpm).toBe(50);
    expect(result.accuracy).toBe(100);
  });

  it('phát hiện ký tự sai', () => {
    const result = calculateTypingMetrics('abcde', 'abxde', 60000);

    expect(result.correctChars).toBe(4);
    expect(result.incorrectChars).toBe(1);
    expect(result.accuracy).toBe(80);
  });

  it('xử lý văn bản rỗng', () => {
    const result = calculateTypingMetrics('', '', 0);

    expect(result.wpm).toBe(0);
    expect(result.correctChars).toBe(0);
    expect(result.incorrectChars).toBe(0);
    expect(result.accuracy).toBe(100);
  });

  it('không tính chữ chưa gõ là sai', () => {
    const result = calculateTypingMetrics('abcde', 'ab', 60000);

    expect(result.correctChars).toBe(2);
    expect(result.incorrectChars).toBe(0);
    expect(result.accuracy).toBe(100);
  });

  it('tính chữ gõ thừa và dấu cách', () => {
    const extra = calculateTypingMetrics('ab', 'abc', 60000);
    const space = calculateTypingMetrics('a b', 'axb', 60000);

    expect(extra.correctChars).toBe(2);
    expect(extra.incorrectChars).toBe(1);
    expect(extra.accuracy).toBe(67);
    expect(space.correctChars).toBe(2);
    expect(space.incorrectChars).toBe(1);
  });

  it('phân biệt hoa thường tiếng Việt', () => {
    const result = calculateTypingMetrics('Mỗi', 'mỗi', 60000);

    expect(result.correctChars).toBe(2);
    expect(result.incorrectChars).toBe(1);
  });

  it('WPM chỉ tính chữ đúng', () => {
    const result = calculateTypingMetrics('aaaaabbbbb', 'aaaaaxxxxx', 60000);

    expect(result.correctChars).toBe(5);
    expect(result.incorrectChars).toBe(5);
    expect(result.wpm).toBe(1);
  });

  it('không làm tròn độ chính xác lên 100 khi còn chữ sai', () => {
    const result = calculateTypingMetrics('a'.repeat(200), `${'a'.repeat(199)}b`, 60000);

    expect(result.correctChars).toBe(199);
    expect(result.incorrectChars).toBe(1);
    expect(result.accuracy).toBe(99);
  });

  it('chữ đã sửa không còn tính sai', () => {
    const wrong = calculateTypingMetrics('abc', 'axc', 60000);
    const fixed = calculateTypingMetrics('abc', 'abc', 60000);

    expect(wrong.incorrectChars).toBe(1);
    expect(fixed.incorrectChars).toBe(0);
    expect(fixed.accuracy).toBe(100);
  });

  it('nhận diện Unicode tiếng Việt', () => {
    const result = calculateTypingMetrics('á', 'a\u0301', 60000);

    expect(result.correctChars).toBe(1);
    expect(result.accuracy).toBe(100);
  });

  it('tính Telex trên chữ đã ghép, không giữ lỗi của phím dấu', () => {
    const base = calculateTypingMetrics('ô', 'o', 60000);
    const circumflex = calculateTypingMetrics('ô', 'ô', 60000);
    const beforeTone = calculateTypingMetrics('ngày', 'ngay', 60000);
    const afterTone = calculateTypingMetrics('ngày', 'ngày', 60000);
    const stroke = calculateTypingMetrics('đúng', 'dúng', 60000);
    const word = calculateTypingMetrics('đúng', 'đúng', 60000);

    expect(base.incorrectChars).toBe(1);
    expect(circumflex.correctChars).toBe(1);
    expect(circumflex.incorrectChars).toBe(0);
    expect(beforeTone.correctChars).toBe(3);
    expect(beforeTone.incorrectChars).toBe(1);
    expect(afterTone.accuracy).toBe(100);
    expect(stroke.correctChars).toBe(3);
    expect(stroke.incorrectChars).toBe(1);
    expect(word.accuracy).toBe(100);
  });

  it('gộp dấu Telex và VNI về cùng một ký tự', () => {
    const telex = calculateTypingMetrics('tôi luyện', 'to\u0302i luy\u00ea\u0323n', 60000);
    const vni = calculateTypingMetrics('ệ', 'e\u0302\u0323', 60000);
    const horn = calculateTypingMetrics('ướ', 'u\u031bo\u031b\u0301', 60000);

    expect(telex.accuracy).toBe(100);
    expect(telex.correctChars).toBe(9);
    expect(vni.correctChars).toBe(1);
    expect(horn.correctChars).toBe(2);
    expect(horn.accuracy).toBe(100);
  });

  it('không coi hai cách đặt dấu khác nhau là cùng một chữ', () => {
    const result = calculateTypingMetrics('ướ', 'ứơ', 60000);

    expect(result.correctChars).toBe(0);
    expect(result.incorrectChars).toBe(2);
  });
});
