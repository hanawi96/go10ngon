import { splitGraphemes } from './typing-engine';

export interface TypingMetrics {
  typedChars: number;
  correctChars: number;
  incorrectChars: number;
  accuracy: number;
  wpm: number;
}

export function calculateTypingMetrics(
  expected: string,
  actual: string,
  elapsedMs: number,
): TypingMetrics {
  const expectedChars = splitGraphemes(expected);
  const typedChars = splitGraphemes(actual);
  const typedCount = typedChars.length;
  let correctChars = 0;

  // So đúng vị trí từng ký tự đã gõ. Chữ chưa gõ không tính sai.
  // Một chữ sai không kéo các chữ khớp phía sau thành sai.
  for (let index = 0; index < typedCount; index++) {
    if (typedChars[index] === expectedChars[index]) {
      correctChars++;
    }
  }

  const incorrectChars = typedCount - correctChars;
  let accuracy = typedCount === 0 ? 100 : Math.round((correctChars * 100) / typedCount);

  // 100% chỉ khi không còn chữ sai. Không làm tròn 99,5% thành 100%.
  if (incorrectChars > 0 && accuracy > 99) {
    accuracy = 99;
  }

  // WPM thực: chỉ chữ đúng, 5 ký tự tính là một từ.
  const wpm = elapsedMs < 1000 ? 0 : Math.round(correctChars / 5 / (elapsedMs / 60000));

  return {
    typedChars: typedCount,
    correctChars,
    incorrectChars,
    accuracy,
    wpm,
  };
}
