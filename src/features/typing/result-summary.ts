import { groupTypingTokens, splitGraphemes } from './typing-engine';

export const SPEED_MARK_SECONDS = 5;
const DRILL_WORD_LIMIT = 24;

export interface SpeedPoint {
  second: number;
  wpm: number;
}

export interface SpeedChartModel {
  points: SpeedPoint[];
  maxWpm: number;
  yTicks: number[];
  labelEvery: number;
}

export function accuracyRemark(accuracy: number): string {
  if (accuracy >= 100) return 'Hoàn hảo';
  if (accuracy >= 98) return 'Xuất sắc';
  if (accuracy >= 95) return 'Rất tốt';
  if (accuracy >= 90) return 'Tốt';
  if (accuracy >= 80) return 'Khá';
  if (accuracy >= 70) return 'Trung bình';
  return 'Cần cải thiện';
}

export function findPreviousWpm(
  results: readonly { lessonId: string; durationSeconds: number; wpm: number }[],
  lessonId: string,
  durationSeconds: number,
): number | null {
  const previous = results.find(
    (item) => item.lessonId === lessonId && item.durationSeconds === durationSeconds,
  );

  return previous ? previous.wpm : null;
}

// Mốc 5 giây. Trục dọc làm tròn lên bội số của 20 để vạch kẻ cách đều.
export function speedChartModel(
  marks: readonly number[],
  stepSeconds = SPEED_MARK_SECONDS,
): SpeedChartModel {
  const step = Math.max(1, stepSeconds);
  const points = marks.map((wpm, index) => ({
    second: (index + 1) * step,
    wpm,
  }));
  const peak = points.reduce((max, point) => Math.max(max, point.wpm), 0);
  const maxWpm = Math.max(20, Math.ceil(peak / 20) * 20);
  const yTicks = [maxWpm, (maxWpm * 3) / 4, maxWpm / 2, maxWpm / 4, 0];
  const labelEvery = points.length <= 6 ? 1 : Math.ceil(points.length / 6);

  return { points, maxWpm, yTicks, labelEvery };
}

// Chỉ lấy từ đã gõ tới và còn lệch. Từ chưa tới không tính là lỗi.
export function mistakeDrillText(expected: string, typed: string): string {
  const expectedChars = splitGraphemes(expected);
  const typedChars = splitGraphemes(typed);
  const words: string[] = [];
  const seen = new Set<string>();

  for (const token of groupTypingTokens(expectedChars)) {
    if (token.kind !== 'word' || token.start >= typedChars.length) continue;

    let wrong = false;

    for (let index = 0; index < token.characters.length; index += 1) {
      const typedIndex = token.start + index;
      if (typedIndex >= typedChars.length) break;

      if (typedChars[typedIndex] !== token.characters[index]) {
        wrong = true;
        break;
      }
    }

    if (!wrong) continue;

    const word = token.characters.join('');
    const key = word.toLocaleLowerCase('vi');
    if (seen.has(key)) continue;

    seen.add(key);
    words.push(word);

    if (words.length >= DRILL_WORD_LIMIT) break;
  }

  return words.join(' ');
}
