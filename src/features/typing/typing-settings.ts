export const TYPING_SETTINGS_KEY = 'go10ngon:typing-settings:v1';

export const TYPING_FONTS = ['system', 'mono'] as const;
export const TYPING_FONT_SIZES = ['sm', 'md', 'lg'] as const;

export type TypingFont = (typeof TYPING_FONTS)[number];
export type TypingFontSize = (typeof TYPING_FONT_SIZES)[number];

export interface TypingSettings {
  font: TypingFont;
  fontSize: TypingFontSize;
  sound: boolean;
  keyboard: boolean;
}

export const DEFAULT_TYPING_SETTINGS: TypingSettings = {
  font: 'system',
  fontSize: 'md',
  sound: false,
  keyboard: true,
};

type SettingsListener = (settings: TypingSettings) => void;

let currentSettings: TypingSettings = { ...DEFAULT_TYPING_SETTINGS };
let hydrated = false;
const listeners = new Set<SettingsListener>();

function isTypingFont(value: unknown): value is TypingFont {
  return value === 'system' || value === 'mono';
}

function isTypingFontSize(value: unknown): value is TypingFontSize {
  return value === 'sm' || value === 'md' || value === 'lg';
}

export function parseTypingSettings(value: unknown): TypingSettings {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return {
    font: isTypingFont(source.font) ? source.font : DEFAULT_TYPING_SETTINGS.font,
    fontSize: isTypingFontSize(source.fontSize)
      ? source.fontSize
      : DEFAULT_TYPING_SETTINGS.fontSize,
    sound: source.sound === true,
    keyboard: source.keyboard !== false,
  };
}

export function loadTypingSettings(): TypingSettings {
  try {
    const raw = window.localStorage.getItem(TYPING_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_TYPING_SETTINGS };

    return parseTypingSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_TYPING_SETTINGS };
  }
}

export function saveTypingSettings(settings: TypingSettings): boolean {
  try {
    window.localStorage.setItem(TYPING_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

// Gắn lên <html> để CSS đổi font ngay, kể cả trước khi Svelte chạy.
// Script trong <head> phải dùng cùng khóa và cùng các giá trị hợp lệ.
export function applyTypingSettings(settings: TypingSettings): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.typingFont = settings.font;
  root.dataset.typingSize = settings.fontSize;

  if (settings.keyboard) {
    delete root.dataset.typingKeyboard;
  } else {
    root.dataset.typingKeyboard = 'off';
  }
}

function publish(settings: TypingSettings) {
  currentSettings = settings;

  for (const listener of listeners) {
    listener(currentSettings);
  }
}

export function getTypingSettings(): TypingSettings {
  return currentSettings;
}

export function subscribeTypingSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  listener(currentSettings);

  return () => {
    listeners.delete(listener);
  };
}

export function hydrateTypingSettings(): void {
  if (hydrated || typeof window === 'undefined') return;

  hydrated = true;
  const loaded = loadTypingSettings();
  applyTypingSettings(loaded);
  publish(loaded);
}

export function updateTypingSettings(patch: Partial<TypingSettings>): boolean {
  const next = { ...currentSettings, ...patch };
  const saved = saveTypingSettings(next);
  applyTypingSettings(next);
  publish(next);
  return saved;
}
