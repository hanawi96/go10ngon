import { splitGraphemes } from './typing-engine';
import { getTypingSettings } from './typing-settings';

const CLICK_SECONDS = 0.045;

let audioContext: AudioContext | undefined;

// null khi không có ký tự mới, nên xóa chữ không phát tiếng.
export function committedTypingCorrect(
  previous: string,
  next: string,
  expected: string,
): boolean | null {
  const previousChars = splitGraphemes(previous);
  const nextChars = splitGraphemes(next);

  if (nextChars.length <= previousChars.length) return null;

  const expectedChars = splitGraphemes(expected);
  const start = previousChars.length;

  return nextChars.slice(start).every((char, offset) => char === expectedChars[start + offset]);
}

function getAudioContext(): AudioContext | undefined {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return undefined;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export function playTypingSound(correct: boolean): void {
  if (!getTypingSettings().sound) return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    void context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = correct ? 740 : 196;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(correct ? 0.03 : 0.045, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + CLICK_SECONDS);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + CLICK_SECONDS);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}

export function playCommittedTypingSound(previous: string, next: string, expected: string): void {
  if (!getTypingSettings().sound) return;

  const correct = committedTypingCorrect(previous, next, expected);
  if (correct === null) return;

  playTypingSound(correct);
}
