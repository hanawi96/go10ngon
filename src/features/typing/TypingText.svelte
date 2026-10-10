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

  // Con trỏ ngắn hơn thân chữ một chút cho khỏi đụng dòng trên.
  const CARET_INSET = 3;

  let expectedChars = $derived(splitGraphemes(text));
  let typedChars = $derived(splitGraphemes(typed));

  // Tự chuyển vùng khi người dùng gõ thêm.
  let visibleStart = $derived(Math.floor(typedChars.length / PAGE_SIZE) * PAGE_SIZE);

  let visibleChars = $derived(expectedChars.slice(visibleStart, visibleStart + VISIBLE_SIZE));

  let textElement = $state<HTMLDivElement>();
  let caretElement = $state<HTMLSpanElement>();

  // Đặt thẳng vào ký tự đang gõ. Không trượt, để con trỏ luôn khớp chữ.
  function placeCaret() {
    const root = textElement;
    const caret = caretElement;
    if (!root || !caret) return;

    const active = root.querySelector<HTMLElement>('.character.active');
    const characters = root.querySelectorAll<HTMLElement>('.character');
    const target = active ?? characters[characters.length - 1];

    if (!target) {
      caret.hidden = true;
      return;
    }

    caret.hidden = false;

    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const x = active ? targetRect.left - rootRect.left - 1 : targetRect.right - rootRect.left;
    const y = targetRect.top - rootRect.top + CARET_INSET;
    const height = Math.max(2, targetRect.height - CARET_INSET * 2);

    caret.style.height = `${height}px`;
    caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  $effect(() => {
    void text;
    void typed;
    void textElement;
    void caretElement;
    placeCaret();
  });

  $effect(() => {
    const root = textElement;
    if (!root) return;

    const observer = new ResizeObserver(() => {
      placeCaret();
    });

    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="typing-text" bind:this={textElement}>
  {#each visibleChars as character, index (visibleStart + index)}
    {@const absoluteIndex = visibleStart + index}

    <span
      class="character"
      class:correct={absoluteIndex < typedChars.length && typedChars[absoluteIndex] === character}
      class:incorrect={absoluteIndex < typedChars.length && typedChars[absoluteIndex] !== character}
      class:active={absoluteIndex === typedChars.length}
      >{character === ' ' ? '\u00a0' : character}</span
    >
  {/each}

  <span class="caret" bind:this={caretElement} aria-hidden="true"></span>
</div>

<style>
  .typing-text {
    position: relative;
    font-size: clamp(22px, 3vw, 30px);
    line-height: 1.9;
    letter-spacing: 0.3px;

    overflow-wrap: anywhere;
    user-select: none;
  }

  .character {
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

  .caret {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    pointer-events: none;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    animation: typing-caret-blink 1s step-end infinite;
  }

  @keyframes typing-caret-blink {
    0%,
    49% {
      opacity: 1;
    }

    50%,
    100% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      animation: none;
    }
  }
</style>
