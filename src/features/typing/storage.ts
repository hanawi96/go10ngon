
import type { LessonLanguage } from './lessons';

export interface TypingResult {
  id: string;
  createdAt: string;
  lessonId: string;
  language: LessonLanguage;
  durationSeconds: number;
  elapsedMs: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  completed: boolean;
}

const STORAGE_KEY = 'go10ngon:typing-results:v1';
export const MAX_RESULTS = 50;

// Kiểm tra dữ liệu đọc từ trình duyệt.
function isTypingResult(value: unknown): value is TypingResult {
  if (!value || typeof value !== 'object') return false;

  const result = value as Record<string, unknown>;

  return (
    typeof result.id === 'string' &&
    typeof result.createdAt === 'string' &&
    Number.isFinite(Date.parse(result.createdAt)) &&
    typeof result.lessonId === 'string' &&
    (result.language === 'vi' || result.language === 'en') &&
    typeof result.durationSeconds === 'number' &&
    Number.isFinite(result.durationSeconds) &&
    typeof result.elapsedMs === 'number' &&
    Number.isFinite(result.elapsedMs) &&
    typeof result.wpm === 'number' &&
    Number.isFinite(result.wpm) &&
    typeof result.accuracy === 'number' &&
    Number.isFinite(result.accuracy) &&
    typeof result.correctChars === 'number' &&
    Number.isFinite(result.correctChars) &&
    typeof result.incorrectChars === 'number' &&
    Number.isFinite(result.incorrectChars) &&
    typeof result.completed === 'boolean'
  );
}

// Đọc tối đa 50 kết quả đã lưu.
export function loadTypingHistory(): TypingResult[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTypingResult).slice(0, MAX_RESULTS);
  } catch {
    return [];
  }
}

// Lưu kết quả. Trả về false nếu trình duyệt từ chối lưu.
export function saveTypingHistory(results: TypingResult[]): boolean {
  try {
    const limitedResults = results.slice(0, MAX_RESULTS);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(limitedResults),
    );

    return true;
  } catch {
    return false;
  }
}
