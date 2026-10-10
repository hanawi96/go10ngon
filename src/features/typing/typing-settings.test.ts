import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_TYPING_SETTINGS,
  TYPING_SETTINGS_KEY,
  loadTypingSettings,
  parseTypingSettings,
  saveTypingSettings,
} from './typing-settings';

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

describe('Typing settings', () => {
  it('trả về mặc định khi chưa lưu', () => {
    mockStorage();

    expect(loadTypingSettings()).toEqual(DEFAULT_TYPING_SETTINGS);
  });

  it('lưu và đọc lại đủ bốn mục', () => {
    mockStorage();

    const settings = {
      font: 'mono' as const,
      fontSize: 'lg' as const,
      sound: true,
      keyboard: false,
    };

    expect(saveTypingSettings(settings)).toBe(true);
    expect(loadTypingSettings()).toEqual(settings);
  });

  it('bỏ trường hỏng và giữ phần còn hợp lệ', () => {
    expect(
      parseTypingSettings({
        font: 'comic',
        fontSize: 'xl',
        sound: 'yes',
        keyboard: false,
      }),
    ).toEqual({
      font: 'system',
      fontSize: 'md',
      sound: false,
      keyboard: false,
    });
  });

  it('giữ mặc định cho mục không có trong dữ liệu cũ', () => {
    expect(parseTypingSettings({ font: 'mono', sound: true })).toEqual({
      font: 'mono',
      fontSize: 'md',
      sound: true,
      keyboard: true,
    });
  });

  it('không lỗi khi dữ liệu lưu bị hỏng', () => {
    const data = mockStorage();
    data.set(TYPING_SETTINGS_KEY, '{invalid-json');

    expect(loadTypingSettings()).toEqual(DEFAULT_TYPING_SETTINGS);
  });

  it('trả về false khi trình duyệt từ chối lưu', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('full');
        },
      },
    });

    expect(saveTypingSettings(DEFAULT_TYPING_SETTINGS)).toBe(false);
  });
});
