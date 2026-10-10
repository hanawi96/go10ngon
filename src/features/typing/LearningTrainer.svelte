<script lang="ts">
  import { onMount, tick } from 'svelte';

  import TypingText from './TypingText.svelte';
  import TypingSettings from './TypingSettings.svelte';
  import VirtualKeyboard from './VirtualKeyboard.svelte';
  import CapsLockNotice from './CapsLockNotice.svelte';

  import { hydrateTypingSettings, subscribeTypingSettings } from './typing-settings';
  import { playCommittedTypingSound } from './typing-sound';

  import { LEARNING_LESSONS } from './learning-lessons';
  import {
    TYPING_IME_SLACK,
    isTypingCaretKey,
    isTypingEditAtEnd,
    isTypingTextComplete,
    limitTypingText,
    normalizeTypingText,
    shouldSnapTypingCaret,
    splitGraphemes,
  } from './typing-engine';
  import { calculateTypingMetrics } from './metrics';

  const STORAGE_KEY = 'go10ngon:learning-progress:v1';

  let currentIndex = $state(0);
  let focusMode = $state(false);
  let showKeyboard = $state(true);
  let typedText = $state('');
  let completedIds = $state<string[]>([]);
  let storageWarning = $state(false);

  let inputElement: HTMLTextAreaElement;
  let isComposing = false;

  let currentLesson = $derived(LEARNING_LESSONS[currentIndex]);
  let expectedChars = $derived(splitGraphemes(currentLesson.text));

  let metrics = $derived(calculateTypingMetrics(currentLesson.text, typedText, 0));

  let progress = $derived(
    expectedChars.length === 0
      ? 0
      : Math.min(100, Math.round((metrics.typedChars * 100) / expectedChars.length)),
  );

  let isComplete = $derived(isTypingTextComplete(currentLesson.text, typedText));

  let nextCharacter = $derived(
    isComplete
      ? null
      : metrics.typedChars >= expectedChars.length
        ? '\b'
        : (expectedChars[metrics.typedChars] ?? null),
  );

  // Khôi phục những bài đã hoàn thành.
  onMount(() => {
    hydrateTypingSettings();
    const stopSettings = subscribeTypingSettings((settings) => {
      showKeyboard = settings.keyboard;
    });

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = parsed.filter(
            (id): id is string =>
              typeof id === 'string' && LEARNING_LESSONS.some((lesson) => lesson.id === id),
          );

          completedIds = [...new Set(validIds)];
        }
      }
    } catch {
      storageWarning = true;
    }

    inputElement?.focus();

    return () => {
      stopSettings();
    };
  });

  function markLessonComplete() {
    if (completedIds.includes(currentLesson.id)) return;

    completedIds = [...completedIds, currentLesson.id];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
      storageWarning = false;
    } catch {
      storageWarning = true;
    }
  }

  function updateTyping(value: string) {
    if (isComplete) {
      markLessonComplete();
      return;
    }

    // Chừa vài ký tự cho phím dấu Telex/VNI trước khi bộ gõ nuốt.
    const nextText = limitTypingText(value, expectedChars.length + TYPING_IME_SLACK);

    if (nextText !== typedText) {
      playCommittedTypingSound(typedText, nextText, currentLesson.text);
    }

    typedText = nextText;

    if (isTypingTextComplete(currentLesson.text, nextText)) {
      markLessonComplete();
    }

    if (normalizeTypingText(inputElement.value) === nextText) {
      return;
    }

    inputElement.value = nextText;
  }

  function handleInput(event: Event) {
    const inputEvent = event as InputEvent;

    if (isComposing || inputEvent.isComposing) {
      return;
    }

    const target = event.currentTarget as HTMLTextAreaElement;

    updateTyping(target.value);
  }

  function handleBeforeInput(event: InputEvent) {
    const target = event.currentTarget as HTMLTextAreaElement;
    const length = target.value.length;

    if (
      !isTypingEditAtEnd(
        target.value,
        target.selectionStart ?? length,
        target.selectionEnd ?? length,
        event.inputType,
      )
    ) {
      event.preventDefault();
    }
  }

  function handleCompositionEnd(event: CompositionEvent) {
    isComposing = false;

    const target = event.currentTarget as HTMLTextAreaElement;
    updateTyping(target.value);
  }

  async function toggleFocusMode() {
    focusMode = !focusMode;

    await tick();

    if (!isComplete) {
      inputElement?.focus();
    }
  }

  function focusTypingCaret() {
    const caret = inputElement.value.length;
    inputElement.setSelectionRange(caret, caret);
  }

  function handleFocusKeydown(event: KeyboardEvent) {
    if (isComposing || event.isComposing) return;

    if (event.key === 'Escape' && focusMode) {
      focusMode = false;
      return;
    }

    if (isTypingCaretKey(event.key, event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return;
    }

    if (
      shouldSnapTypingCaret(
        inputElement.value,
        inputElement.selectionStart ?? inputElement.value.length,
        inputElement.selectionEnd ?? inputElement.value.length,
      )
    ) {
      focusTypingCaret();
    }
  }

  async function selectLesson(index: number) {
    if (index < 0 || index >= LEARNING_LESSONS.length) return;

    currentIndex = index;
    typedText = '';
    isComposing = false;

    await tick();

    inputElement.value = '';
    inputElement.focus();
  }
</script>

<section class="learning" class:focus-mode={focusMode}>
  <div class="toolbar">
    <div class="lesson-list">
      {#each LEARNING_LESSONS as lesson, index (lesson.id)}
        <button
          type="button"
          class="lesson-choice"
          aria-pressed={index === currentIndex}
          onclick={() => selectLesson(index)}
        >
          <span class="lesson-number">{index + 1}</span>
          <span class="lesson-name">{lesson.title}</span>
          {#if completedIds.includes(lesson.id)}
            <span class="completed-label"><span class="visually-hidden">Đã xong</span>✓</span>
          {/if}
        </button>
      {/each}
    </div>

    <div class="focus-controls">
      <button
        type="button"
        class="focus-toggle"
        aria-pressed={focusMode}
        aria-label={focusMode ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung'}
        onclick={toggleFocusMode}
      >
        {focusMode ? 'Thoát' : 'Tập trung'}
      </button>

      <TypingSettings suspended={focusMode} />

      {#if focusMode}
        <span class="focus-hint">Nhấn Esc để thoát.</span>
      {/if}
    </div>
  </div>

  <div class="passage-heading">
    <p class="passage-label">
      Bài {currentIndex + 1}/{LEARNING_LESSONS.length} · {currentLesson.title}
    </p>
    <p class="lesson-description">{currentLesson.description}</p>
  </div>

  <p class="metrics">
    <span>Đúng <strong>{metrics.correctChars}</strong></span>
    <span>Sai <strong>{metrics.incorrectChars}</strong></span>
    <span>Chính xác <strong>{metrics.accuracy}%</strong></span>
    <span>Tiến độ <strong>{progress}%</strong></span>
  </p>

  <div
    class="progress-track"
    role="progressbar"
    aria-label="Tiến độ bài luyện"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={progress}
  >
    <div class="progress-fill" style:width={`${progress}%`}></div>
  </div>

  <CapsLockNotice />

  <div class="stage">
    <label for="learning-input" class="typing-target">
      <span class="visually-hidden"> Nhấp vào văn bản để bắt đầu gõ </span>
    </label>
    <div class="text-box">
      <TypingText text={currentLesson.text} typed={typedText} />

      <textarea
        bind:this={inputElement}
        id="learning-input"
        class="typing-capture"
        value={typedText}
        oninput={handleInput}
        onbeforeinput={handleBeforeInput}
        ondrop={(event) => event.preventDefault()}
        onkeydown={handleFocusKeydown}
        onfocus={focusTypingCaret}
        oncompositionstart={() => (isComposing = true)}
        oncompositionend={handleCompositionEnd}
        onpaste={(event) => event.preventDefault()}
        disabled={isComplete}
        spellcheck={false}
        autocomplete="off"
        autocapitalize="off"></textarea>
    </div>
  </div>

  {#if showKeyboard && !focusMode}
    <VirtualKeyboard {nextCharacter} />
  {/if}

  {#if isComplete}
    <div class="success-message" role="status">
      <strong>Hoàn thành bài học!</strong>
      <p>
        Bạn đã gõ chính xác toàn bộ nội dung.
        {#if currentIndex === LEARNING_LESSONS.length - 1}
          Bạn đã hoàn thành cấp độ cuối cùng!
        {:else}
          Hãy tiếp tục với bài học kế tiếp.
        {/if}
      </p>
    </div>
  {/if}

  {#if storageWarning}
    <p class="storage-warning" role="alert">Không thể đọc hoặc lưu tiến độ trên trình duyệt này.</p>
  {/if}

  <div class="actions">
    <button type="button" class="reset-button" onclick={() => selectLesson(currentIndex)}>
      Luyện lại
    </button>

    {#if isComplete && currentIndex < LEARNING_LESSONS.length - 1}
      <button type="button" class="next-button" onclick={() => selectLesson(currentIndex + 1)}>
        Bài tiếp theo →
      </button>
    {/if}
  </div>
</section>

<style>
  .learning {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-4);
  }

  .toolbar,
  .lesson-list,
  .focus-controls,
  .metrics,
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .toolbar,
  .passage-heading,
  .metrics,
  .actions {
    justify-content: center;
  }

  .passage-heading {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }

  .passage-label,
  .lesson-description,
  .metrics {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .metrics strong {
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .lesson-choice,
  .focus-toggle,
  .reset-button {
    padding: var(--space-2) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
  }

  .lesson-choice {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    max-width: 100%;
  }

  .lesson-choice:hover:not(:disabled),
  .focus-toggle:hover:not(:disabled),
  .reset-button:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }

  .lesson-choice[aria-pressed='true'],
  .focus-toggle[aria-pressed='true'] {
    background: var(--color-primary-soft);
    color: var(--color-primary);
  }

  .lesson-number,
  .completed-label {
    color: var(--color-primary);
    font-size: var(--font-size-xs);
  }

  .lesson-choice[aria-pressed='true'] .lesson-number {
    color: var(--color-primary);
  }

  .completed-label {
    color: var(--color-success);
  }

  .lesson-name {
    min-width: 0;
  }

  .progress-track {
    height: 3px;
    overflow: hidden;
    border-radius: var(--radius-full);
    background: var(--color-surface);
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
    transition: width var(--transition-fast);
  }

  .stage {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    min-height: clamp(200px, 32vh, 420px);
  }

  .text-box {
    position: relative;
    width: 100%;
    padding: var(--space-2) 0;
    cursor: text;
  }

  .success-message {
    padding: var(--space-4);
    background: var(--color-success-soft);
    border-radius: var(--radius-md);
    color: var(--color-success);
  }

  .success-message p {
    margin: var(--space-2) 0 0;
  }

  .storage-warning {
    color: var(--color-error);
    font-size: var(--font-size-sm);
  }

  .focus-hint {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .typing-target {
    position: absolute;
    inset: 0;
    cursor: text;
  }

  .typing-capture {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
    border: 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .learning.focus-mode .lesson-list,
  .learning.focus-mode .lesson-description {
    display: none;
  }
</style>
