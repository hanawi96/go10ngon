import { describe, expect, it } from 'vitest';
import { LEARNING_LESSONS } from './learning-lessons';

describe('Learning Lessons', () => {
  it('có đủ 6 cấp độ', () => {
    expect(LEARNING_LESSONS).toHaveLength(6);
  });

  it('không có ID bài học trùng nhau', () => {
    const ids = LEARNING_LESSONS.map((lesson) => lesson.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tất cả bài học đều có nội dung', () => {
    for (const lesson of LEARNING_LESSONS) {
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.description.trim().length).toBeGreaterThan(0);
      expect(lesson.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('bài đầu chỉ sử dụng các phím hàng cơ sở', () => {
    const allowed = new Set([... 'asdfjkl; ']);

    for (const character of LEARNING_LESSONS[0].text) {
      expect(allowed.has(character)).toBe(true);
    }
  });

  it('bài cuối có ký tự tiếng Việt', () => {
    const finalLesson = LEARNING_LESSONS.at(-1);

    expect(finalLesson).toBeDefined();
    expect(/[^\x00-\x7F]/.test(finalLesson!.text)).toBe(true);
  });
});