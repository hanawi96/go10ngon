<script lang="ts">
  import { groupTypingTokens, nextTypingPageEnd, splitGraphemes } from './typing-engine';

  let {
    text,
    typed,
  }: {
    text: string;
    typed: string;
  } = $props();

  // Một trang văn bản. Chỉ chuyển trang khi gõ hết các chữ đang hiện.
  const PAGE_SIZE = 260;

  // Con trỏ ngắn hơn thân chữ một chút cho khỏi đụng dòng trên.
  const CARET_INSET = 3;

  let expectedChars = $derived(splitGraphemes(text));
  let typedChars = $derived(splitGraphemes(typed));

  let page = $derived.by(() => {
    const total = expectedChars.length;
    const typedCount = Math.min(typedChars.length, total);
    const cursor = typedCount >= total && total > 0 ? total - 1 : typedCount;
    let start = 0;

    while (start < total) {
      const end = nextTypingPageEnd(expectedChars, start, PAGE_SIZE);

      if (cursor < end || end >= total) {
        return { start, end };
      }

      start = end;
    }

    return { start: 0, end: total };
  });

  let visibleChars = $derived(expectedChars.slice(page.start, page.end));
  let tokens = $derived(groupTypingTokens(visibleChars, page.start));

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

  // Đổi font hoặc cỡ chữ không đổi text, nên phải đo lại con trỏ.
  $effect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      placeCaret();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-typing-font', 'data-typing-size'],
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="typing-text" bind:this={textElement}>
  {#each tokens as token (token.start)}
    {#if token.kind === 'word'}
      <span class="word">
        {#each token.characters as character, offset (token.start + offset)}
          {@const absoluteIndex = token.start + offset}
          <span
            class="character"
            class:correct={absoluteIndex < typedChars.length &&
              typedChars[absoluteIndex] === character}
            class:incorrect={absoluteIndex < typedChars.length &&
              typedChars[absoluteIndex] !== character}
            class:active={absoluteIndex === typedChars.length}>{character}</span
          >
        {/each}
      </span>
    {:else}
      {@const absoluteIndex = token.start}
      {@const character = token.characters[0]}
      <span
        class="character"
        class:correct={absoluteIndex < typedChars.length && typedChars[absoluteIndex] === character}
        class:incorrect={absoluteIndex < typedChars.length &&
          typedChars[absoluteIndex] !== character}
        class:active={absoluteIndex === typedChars.length}>{character}</span
      >
    {/if}
  {/each}

  <span class="caret" bind:this={caretElement} aria-hidden="true"></span>
</div>

<style>
  .typing-text {
    position: relative;
    font-family: var(--typing-font-family);
    font-size: var(--typing-font-size);
    line-height: 1.9;
    letter-spacing: 0.3px;
    white-space: pre-wrap;
    user-select: none;
  }

  .word {
    white-space: nowrap;
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
