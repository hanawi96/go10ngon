import { describe, expect, it } from 'vitest';

import {
  LESSONS,
  buildContinuousLessonText,
} from './lessons';

describe('Continuous Typing Lessons', () => {
  const lesson = LESSONS.find(
    (item) => item.id === 'vi-basic',
  );

  if (!lesson) {
    throw new Error('Không tìm thấy bài luyện vi-basic');
  }

  it('giữ nguyên bài gốc khi chưa nối thêm', () => {
    const result = buildContinuousLessonText(lesson, 0);

    expect(result).toBe(lesson.text);
  });

  it('nối thêm văn bản khi cần', () => {
    const result = buildContinuousLessonText(lesson, 1);

    expect(result.startsWith(lesson.text)).toBe(true);
    expect(result.length).toBeGreaterThan(lesson.text.length);
  });

  it('giữ nguyên nội dung cũ khi bổ sung nhiều đoạn', () => {
    const first = buildContinuousLessonText(lesson, 1);
    const second = buildContinuousLessonText(lesson, 2);

    expect(second.startsWith(first)).toBe(true);
    expect(second.length).toBeGreaterThan(first.length);
  });
});