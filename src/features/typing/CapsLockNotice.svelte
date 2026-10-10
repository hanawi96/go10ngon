<script lang="ts">
  import { onMount } from 'svelte';
  import { readCapsLock } from './typing-engine';

  let capsLockOn = $state(false);

  onMount(() => {
    function syncCapsLock(event: KeyboardEvent) {
      capsLockOn = readCapsLock(event);
    }

    window.addEventListener('keydown', syncCapsLock);
    window.addEventListener('keyup', syncCapsLock);

    return () => {
      window.removeEventListener('keydown', syncCapsLock);
      window.removeEventListener('keyup', syncCapsLock);
    };
  });
</script>

<p class="caps-lock" role="status" hidden={!capsLockOn}>
  Caps Lock đang bật. Tắt để gõ đúng chữ hoa thường.
</p>

<style>
  .caps-lock {
    align-self: center;
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    background: var(--color-error-soft);
    color: var(--color-error);
    font-size: var(--font-size-sm);
    line-height: 1.4;
    text-align: center;
  }

  .caps-lock[hidden] {
    display: none;
  }
</style>
