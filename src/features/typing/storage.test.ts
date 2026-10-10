
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  loadTypingHistory,
  saveTypingHistory,
  type TypingResult,
} from './storage';

const sampleResult: TypingResult = {
  id: 'test-1',
  createdAt: '2026-10-10T07:00:00.000Z',
  lessonId: 'vi-basic',
  language: 'vi',
  durationSeconds: 60,
  elapsedMs: 60000,
  wpm: 50,
  accuracy: 98,
  correctChars: 250,
  incorrectChars: 5,
  completed: false,
};

function mockStorage() {
  const data = new Map<string, string>();

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    },
  });

  return data;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Typing History', () => {
  it('lưu và đọc lại kết quả', () => {
    mockStorage();

    expect(saveTypingHistory([sampleResult])).toBe(true);
    expect(loadTypingHistory()).toEqual([sampleResult]);
  });

  it('chỉ lưu tối đa 50 kết quả', () => {
    mockStorage();

    const results = Array.from({ length: 55 }, (_, index) => ({
      ...sampleResult,
      id: `test-${index}`,
    }));

    saveTypingHistory(results);

    expect(loadTypingHistory()).toHaveLength(50);
  });

  it('không bị lỗi khi dữ liệu lưu bị hỏng', () => {
    const data = mockStorage();

    data.set('go10ngon:typing-results:v1', '{invalid-json');

    expect(loadTypingHistory()).toEqual([]);
  });

  it('có thể xóa toàn bộ lịch sử', () => {
    mockStorage();

    saveTypingHistory([sampleResult]);
    saveTypingHistory([]);

    expect(loadTypingHistory()).toEqual([]);
  });
});
