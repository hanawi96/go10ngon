<script lang="ts">
  import { splitGraphemes } from './typing-engine';

  let {
    text,
    typed,
  }: {
    text: string;
    typed: string;
  } = $props();

  // Số ký tự trước khi chuyển vùng hiển thị.
  const PAGE_SIZE = 120;

  // Số ký tự hiển thị tối đa cùng lúc.
  const VISIBLE_SIZE = 260;

  let expectedChars = $derived(splitGraphemes(text));
  let typedChars = $derived(splitGraphemes(typed));

  // Tự chuyển vùng khi người dùng gõ thêm.
  let visibleStart = $derived(
    Math.floor(typedChars.length / PAGE_SIZE) * PAGE_SIZE,
  );

  let visibleChars = $derived(
    expectedChars.slice(
      visibleStart,
      visibleStart + VISIBLE_SIZE,
    ),
  );
</script>

<div class="typing-text">
  {#each visibleChars as character, index (visibleStart + index)}
    {@const absoluteIndex = visibleStart + index}

    <span
      class="character"
      class:correct={absoluteIndex < typedChars.length &&
        typedChars[absoluteIndex] === character}
      class:incorrect={absoluteIndex < typedChars.length &&
        typedChars[absoluteIndex] !== character}
      class:active={absoluteIndex === typedChars.length}
    >{character === ' ' ? '\u00a0' : character}</span>
  {/each}
</div>

<style>
  .typing-text {
    font-size: clamp(22px, 3vw, 30px);
    line-height: 1.9;
    letter-spacing: 0.3px;

    overflow-wrap: anywhere;
    user-select: none;
  }

  .character {
    position: relative;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
  }

  .character.correct {
    color: var(--color-success);
  }

  .character.incorrect {
    color: var(--color-error);
    background: var(--color-error-soft);
  }

  .character.active::before {
    content: '';

    position: absolute;
    left: -1px;
    top: 3px;
    bottom: 3px;
    width: 2px;

    background: var(--color-primary);
    border-radius: var(--radius-full);
  }
</style>