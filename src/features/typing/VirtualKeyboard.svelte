
<script lang="ts">
  type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  type Hand = 'left' | 'right' | 'both';

  interface KeyboardKey {
    code: string;
    label: string;
    finger: Finger;
    hand: Hand;
    width?: 'wide' | 'large' | 'space';
  }

  let { nextCharacter }: { nextCharacter: string | null } = $props();

  // Bố cục QWERTY ANSI tiêu chuẩn
  const rows: KeyboardKey[][] = [
    [
      { code: 'Backquote', label: '`', finger: 'pinky', hand: 'left' },
      { code: 'Digit1', label: '1', finger: 'pinky', hand: 'left' },
      { code: 'Digit2', label: '2', finger: 'ring', hand: 'left' },
      { code: 'Digit3', label: '3', finger: 'middle', hand: 'left' },
      { code: 'Digit4', label: '4', finger: 'index', hand: 'left' },
      { code: 'Digit5', label: '5', finger: 'index', hand: 'left' },
      { code: 'Digit6', label: '6', finger: 'index', hand: 'right' },
      { code: 'Digit7', label: '7', finger: 'index', hand: 'right' },
      { code: 'Digit8', label: '8', finger: 'middle', hand: 'right' },
      { code: 'Digit9', label: '9', finger: 'ring', hand: 'right' },
      { code: 'Digit0', label: '0', finger: 'pinky', hand: 'right' },
      { code: 'Minus', label: '-', finger: 'pinky', hand: 'right' },
      { code: 'Equal', label: '=', finger: 'pinky', hand: 'right' },
      {
        code: 'Backspace',
        label: '⌫',
        finger: 'pinky',
        hand: 'right',
        width: 'large',
      },
    ],
    [
      { code: 'Tab', label: 'Tab', finger: 'pinky', hand: 'left', width: 'wide' },
      { code: 'KeyQ', label: 'Q', finger: 'pinky', hand: 'left' },
      { code: 'KeyW', label: 'W', finger: 'ring', hand: 'left' },
      { code: 'KeyE', label: 'E', finger: 'middle', hand: 'left' },
      { code: 'KeyR', label: 'R', finger: 'index', hand: 'left' },
      { code: 'KeyT', label: 'T', finger: 'index', hand: 'left' },
      { code: 'KeyY', label: 'Y', finger: 'index', hand: 'right' },
      { code: 'KeyU', label: 'U', finger: 'index', hand: 'right' },
      { code: 'KeyI', label: 'I', finger: 'middle', hand: 'right' },
      { code: 'KeyO', label: 'O', finger: 'ring', hand: 'right' },
      { code: 'KeyP', label: 'P', finger: 'pinky', hand: 'right' },
      { code: 'BracketLeft', label: '[', finger: 'pinky', hand: 'right' },
      { code: 'BracketRight', label: ']', finger: 'pinky', hand: 'right' },
      {
        code: 'Backslash',
        label: '\\',
        finger: 'pinky',
        hand: 'right',
        width: 'wide',
      },
    ],
    [
      {
        code: 'CapsLock',
        label: 'Caps',
        finger: 'pinky',
        hand: 'left',
        width: 'large',
      },
      { code: 'KeyA', label: 'A', finger: 'pinky', hand: 'left' },
      { code: 'KeyS', label: 'S', finger: 'ring', hand: 'left' },
      { code: 'KeyD', label: 'D', finger: 'middle', hand: 'left' },
      { code: 'KeyF', label: 'F', finger: 'index', hand: 'left' },
      { code: 'KeyG', label: 'G', finger: 'index', hand: 'left' },
      { code: 'KeyH', label: 'H', finger: 'index', hand: 'right' },
      { code: 'KeyJ', label: 'J', finger: 'index', hand: 'right' },
      { code: 'KeyK', label: 'K', finger: 'middle', hand: 'right' },
      { code: 'KeyL', label: 'L', finger: 'ring', hand: 'right' },
      { code: 'Semicolon', label: ';', finger: 'pinky', hand: 'right' },
      { code: 'Quote', label: "'", finger: 'pinky', hand: 'right' },
      {
        code: 'Enter',
        label: 'Enter',
        finger: 'pinky',
        hand: 'right',
        width: 'large',
      },
    ],
    [
      {
        code: 'ShiftLeft',
        label: 'Shift',
        finger: 'pinky',
        hand: 'left',
        width: 'large',
      },
      { code: 'KeyZ', label: 'Z', finger: 'pinky', hand: 'left' },
      { code: 'KeyX', label: 'X', finger: 'ring', hand: 'left' },
      { code: 'KeyC', label: 'C', finger: 'middle', hand: 'left' },
      { code: 'KeyV', label: 'V', finger: 'index', hand: 'left' },
      { code: 'KeyB', label: 'B', finger: 'index', hand: 'left' },
      { code: 'KeyN', label: 'N', finger: 'index', hand: 'right' },
      { code: 'KeyM', label: 'M', finger: 'index', hand: 'right' },
      { code: 'Comma', label: ',', finger: 'middle', hand: 'right' },
      { code: 'Period', label: '.', finger: 'ring', hand: 'right' },
      { code: 'Slash', label: '/', finger: 'pinky', hand: 'right' },
      {
        code: 'ShiftRight',
        label: 'Shift',
        finger: 'pinky',
        hand: 'right',
        width: 'large',
      },
    ],
    [
      {
        code: 'Space',
        label: 'Space',
        finger: 'thumb',
        hand: 'both',
        width: 'space',
      },
    ],
  ];

  const symbolKeys: Record<string, string> = {
    ' ': 'Space',
    '\b': 'Backspace',
    '\n': 'Enter',
    '\t': 'Tab',
    '`': 'Backquote',
    '~': 'Backquote',
    '!': 'Digit1',
    '@': 'Digit2',
    '#': 'Digit3',
    $: 'Digit4',
    '%': 'Digit5',
    '^': 'Digit6',
    '&': 'Digit7',
    '*': 'Digit8',
    '(': 'Digit9',
    ')': 'Digit0',
    '-': 'Minus',
    '_': 'Minus',
    '–': 'Minus',
    '—': 'Minus',
    '=': 'Equal',
    '+': 'Equal',
    '[': 'BracketLeft',
    '{': 'BracketLeft',
    ']': 'BracketRight',
    '}': 'BracketRight',
    '\\': 'Backslash',
    '|': 'Backslash',
    ';': 'Semicolon',
    ':': 'Semicolon',
    "'": 'Quote',
    '"': 'Quote',
    '“': 'Quote',
    '”': 'Quote',
    ',': 'Comma',
    '<': 'Comma',
    '.': 'Period',
    '>': 'Period',
    '/': 'Slash',
    '?': 'Slash',
  };

  const fingerNames: Record<Finger, string> = {
    pinky: 'ngón út',
    ring: 'ngón áp út',
    middle: 'ngón giữa',
    index: 'ngón trỏ',
    thumb: 'ngón cái',
  };

  const handNames: Record<Hand, string> = {
    left: 'Tay trái',
    right: 'Tay phải',
    both: 'Hai tay',
  };

  const fingerLegend: { finger: Finger; label: string }[] = [
    { finger: 'pinky', label: 'Ngón út' },
    { finger: 'ring', label: 'Áp út' },
    { finger: 'middle', label: 'Ngón giữa' },
    { finger: 'index', label: 'Ngón trỏ' },
    { finger: 'thumb', label: 'Ngón cái' },
  ];

  const allKeys = rows.flat();

  function getSuggestedKey(character: string | null): string | null {
    if (character === null) return null;

    if (character in symbolKeys) {
      return symbolKeys[character];
    }

    if (/^[0-9]$/.test(character)) {
      return `Digit${character}`;
    }

    // Chuyển chữ tiếng Việt có dấu về phím chữ cái cơ bản.
    const base = character
      .toLocaleLowerCase('vi')
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/\p{M}/gu, '');

    if (/^[a-z]$/.test(base)) {
      return `Key${base.toUpperCase()}`;
    }

    return null;
  }

  let activeCode = $derived(getSuggestedKey(nextCharacter));

  let activeKey = $derived(
    allKeys.find((key) => key.code === activeCode) ?? null,
  );

  let displayCharacter = $derived(
    nextCharacter === ' '
      ? 'Space'
      : nextCharacter === '\b'
        ? 'Backspace'
        : nextCharacter,
  );
</script>

<section class="keyboard-guide" aria-label="Bàn phím ảo hướng dẫn ngón tay">
  <div class="guide-header">
    <h3>Bàn phím hướng dẫn</h3>
    <span>QWERTY</span>
  </div>

  <p class="hint">
    {#if activeKey}
      Phím tiếp theo:
      <strong>{displayCharacter}</strong>
      — {handNames[activeKey.hand]},
      {fingerNames[activeKey.finger]}.
    {:else if nextCharacter === null}
      Không có phím mới cần gõ.
    {:else}
      Chưa có gợi ý cho ký tự này.
    {/if}
  </p>

  <div class="keyboard-scroll">
    <div class="keyboard" aria-hidden="true">
      {#each rows as row, rowIndex (rowIndex)}
        <div class="keyboard-row">
          {#each row as key (key.code)}
            <div
              class={`key finger-${key.finger} ${key.width ? `key-${key.width}` : ''}`}
              class:active={key.code === activeCode}
            >
              <span>{key.label}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="finger-legend">
    {#each fingerLegend as item (item.finger)}
      <div class="legend-item">
        <span class={`legend-dot finger-${item.finger}`}></span>
        <span>{item.label}</span>
      </div>
    {/each}
  </div>

  <p class="keyboard-note">
    Màu sắc hướng dẫn ngón tay; với tiếng Việt có dấu, phím gợi ý
    là phím chữ cái cơ bản.
  </p>
</section>

<style>
  .keyboard-guide {
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .guide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .guide-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text);
  }

  .guide-header > span {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .hint {
    margin: var(--space-3) 0 var(--space-5);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .hint strong {
    color: var(--color-primary);
  }

  .keyboard-scroll {
    overflow-x: auto;
    padding: var(--space-2) 2px;
  }

  .keyboard {
    min-width: 700px;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .keyboard-row {
    display: flex;
    justify-content: center;
    gap: var(--space-1);
  }

  .key {
    --finger-tone: var(--color-border);

    position: relative;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;

    min-width: 0;
    height: 43px;

    background: var(--color-background);
    color: var(--color-text-secondary);

    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);

    font-size: var(--font-size-sm);
    font-weight: 500;

    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast);
  }

  .key::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 6px;
    right: 6px;
    height: 3px;
    border-radius: var(--radius-full);
    background: var(--finger-tone);
  }

   .key:global(.finger-pinky),
  .legend-dot:global(.finger-pinky) {
    --finger-tone: var(--finger-pinky);
  }

  .key:global(.finger-ring),
  .legend-dot:global(.finger-ring) {
    --finger-tone: var(--finger-ring);
  }

  .key:global(.finger-middle),
  .legend-dot:global(.finger-middle) {
    --finger-tone: var(--finger-middle);
  }

  .key:global(.finger-index),
  .legend-dot:global(.finger-index) {
    --finger-tone: var(--finger-index);
  }

  .key:global(.finger-thumb),
  .legend-dot:global(.finger-thumb) {
    --finger-tone: var(--finger-thumb);
  }

  .key:global(.key-wide) {
    flex-grow: 1.4;
  }

  .key:global(.key-large) {
    flex-grow: 1.9;
  }

  .key:global(.key-space) {
    flex: 0 0 40%;
  }

  .key.active {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-text);
    transform: translateY(-2px);
    box-shadow: 0 0 0 1px var(--color-primary);
  }

  .finger-legend {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }

  .legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    background: var(--finger-tone);
  }

  .keyboard-note {
    margin: var(--space-4) 0 0;
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    .keyboard-guide {
      padding: var(--space-4);
    }
  }
</style>
