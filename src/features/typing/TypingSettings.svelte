<script lang="ts">
  import { onMount } from 'svelte';

  import { playTypingSound } from './typing-sound';
  import {
    hydrateTypingSettings,
    subscribeTypingSettings,
    updateTypingSettings,
    type TypingFont,
    type TypingFontSize,
    type TypingSettings,
  } from './typing-settings';

  let { suspended = false }: { suspended?: boolean } = $props();

  let root = $state<HTMLDivElement>();
  let open = $state(false);
  let storageWarning = $state(false);
  let font = $state<TypingFont>('system');
  let fontSize = $state<TypingFontSize>('md');
  let sound = $state(false);
  let keyboard = $state(true);

  function applyLocal(settings: TypingSettings) {
    font = settings.font;
    fontSize = settings.fontSize;
    sound = settings.sound;
    keyboard = settings.keyboard;
  }

  function choose(patch: Partial<TypingSettings>, previewSound = false) {
    storageWarning = !updateTypingSettings(patch);

    if (previewSound) {
      playTypingSound(true);
    }
  }

  // Giữ focus ở ô gõ khi bấm cài đặt bằng chuột.
  function keepTypingFocus(node: HTMLElement) {
    const preventFocusMove = (event: MouseEvent) => {
      event.preventDefault();
    };

    node.addEventListener('mousedown', preventFocusMove);

    return {
      destroy() {
        node.removeEventListener('mousedown', preventFocusMove);
      },
    };
  }

  onMount(() => {
    hydrateTypingSettings();

    const stop = subscribeTypingSettings(applyLocal);

    return () => stop();
  });

  $effect(() => {
    if (suspended) open = false;
  });

  $effect(() => {
    if (!open) return;

    const panel = root;

    function onPointerDown(event: PointerEvent) {
      if (!panel?.contains(event.target as Node)) {
        open = false;
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      open = false;
      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  });
</script>

<div class="typing-settings" bind:this={root} use:keepTypingFocus>
  <button
    type="button"
    class="settings-toggle"
    aria-expanded={open}
    aria-controls="typing-settings-panel"
    onclick={() => (open = !open)}
  >
    Cài đặt
  </button>

  {#if open}
    <div
      id="typing-settings-panel"
      class="settings-panel"
      role="group"
      aria-label="Cài đặt luyện gõ"
    >
      <div class="setting-row">
        <span id="typing-font-label">Font chữ</span>
        <div class="choices" role="group" aria-labelledby="typing-font-label">
          <button
            type="button"
            class="choice"
            aria-pressed={font === 'system'}
            onclick={() => choose({ font: 'system' })}
          >
            Hệ thống
          </button>
          <button
            type="button"
            class="choice"
            aria-pressed={font === 'mono'}
            onclick={() => choose({ font: 'mono' })}
          >
            Đơn cách
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span id="typing-size-label">Cỡ chữ</span>
        <div class="choices" role="group" aria-labelledby="typing-size-label">
          <button
            type="button"
            class="choice"
            aria-pressed={fontSize === 'sm'}
            onclick={() => choose({ fontSize: 'sm' })}
          >
            Nhỏ
          </button>
          <button
            type="button"
            class="choice"
            aria-pressed={fontSize === 'md'}
            onclick={() => choose({ fontSize: 'md' })}
          >
            Vừa
          </button>
          <button
            type="button"
            class="choice"
            aria-pressed={fontSize === 'lg'}
            onclick={() => choose({ fontSize: 'lg' })}
          >
            Lớn
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span id="typing-sound-label">Âm thanh</span>
        <div class="choices" role="group" aria-labelledby="typing-sound-label">
          <button
            type="button"
            class="choice"
            aria-pressed={!sound}
            onclick={() => choose({ sound: false })}
          >
            Tắt
          </button>
          <button
            type="button"
            class="choice"
            aria-pressed={sound}
            onclick={() => choose({ sound: true }, true)}
          >
            Bật
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span id="typing-keyboard-label">Bàn phím ảo</span>
        <div class="choices" role="group" aria-labelledby="typing-keyboard-label">
          <button
            type="button"
            class="choice"
            aria-pressed={keyboard}
            onclick={() => choose({ keyboard: true })}
          >
            Hiện
          </button>
          <button
            type="button"
            class="choice"
            aria-pressed={!keyboard}
            onclick={() => choose({ keyboard: false })}
          >
            Ẩn
          </button>
        </div>
      </div>

      {#if storageWarning}
        <p class="storage-warning">Không lưu được cài đặt trên trình duyệt này.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .typing-settings {
    position: relative;
  }

  .settings-toggle,
  .choice {
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
  }

  .settings-toggle:hover:not(:disabled),
  .choice:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .settings-toggle[aria-expanded='true'],
  .choice[aria-pressed='true'] {
    background: var(--color-primary-soft);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .choice[aria-pressed='true']:hover:not(:disabled) {
    background: var(--color-primary-soft);
  }

  .settings-panel {
    position: absolute;
    z-index: 2;
    top: calc(100% + var(--space-2));
    left: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: min(320px, calc(100vw - var(--space-6)));
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .setting-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .storage-warning {
    margin: 0;
    color: var(--color-error);
    font-size: var(--font-size-xs);
  }
</style>
