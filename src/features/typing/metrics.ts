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

  let correctChars = 0;

  typedChars.forEach((char, index) => {
    if (char === expectedChars[index]) {
      correctChars++;
    }
  });

  const typedCount = typedChars.length;
  const incorrectChars = typedCount - correctChars;

  const accuracy =
    typedCount === 0
      ? 0
      : Math.round((correctChars / typedCount) * 100);

  const wpm =
    elapsedMs < 1000
      ? 0
      : Math.round(
          (correctChars / 5) / (elapsedMs / 60000),
        );

  return {
    typedChars: typedCount,
    correctChars,
    incorrectChars,
    accuracy,
    wpm,
  };
}