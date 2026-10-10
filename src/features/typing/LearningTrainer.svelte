<script lang="ts">
  import { onMount, tick } from 'svelte';

  import TypingText from './TypingText.svelte';
  import VirtualKeyboard from './VirtualKeyboard.svelte';

  import { LEARNING_LESSONS } from './learning-lessons';
  import { isTypingTextComplete, limitTypingText, splitGraphemes } from './typing-engine';
  import { calculateTypingMetrics } from './metrics';

  const STORAGE_KEY = 'go10ngon:learning-progress:v1';

  let currentIndex = $state(0);
  let focusMode = $state(false);
  let typedText = $state('');
  let completedIds = $state<string[]>([]);
  let storageWarning = $state(false);

  let inputElement: HTMLTextAreaElement;
  let isComposing = false;

  let currentLesson = $derived(LEARNING_LESSONS[currentIndex]);
  let expectedChars = $derived(splitGraphemes(currentLesson.text));

  let metrics = $derived(calculateTypingMetrics(currentLesson.text, typedText, 0));

  let progress = $derived(Math.round((metrics.typedChars / expectedChars.length) * 100));

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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      const validIds = parsed.filter(
        (id): id is string =>
          typeof id === 'string' && LEARNING_LESSONS.some((lesson) => lesson.id === id),
      );

      completedIds = [...new Set(validIds)];
    } catch {
      storageWarning = true;
    }

    inputElement?.focus();
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
    if (isComplete) return;

    // Giới hạn theo ký tự Unicode hoàn chỉnh.
    const nextText = limitTypingText(value, expectedChars.length);

    // Chỉ cập nhật trạng thái khi nội dung thực sự thay đổi.
    if (nextText !== typedText) {
      typedText = nextText;
    }

    // Đồng bộ giá trị thực tế của textarea.
    if (inputElement.value !== nextText) {
      inputElement.value = nextText;
    }

    if (isTypingTextComplete(currentLesson.text, nextText)) {
      markLessonComplete();
    }
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
    if (event.inputType.startsWith('insertFromPaste') || event.inputType === 'insertFromDrop') {
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

  function handleFocusKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && focusMode && !isComposing) {
      focusMode = false;
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
  <div class="learning-heading">
    <h2>Lộ trình luyện gõ</h2>
    <p>Học từ các hàng phím cơ bản đến văn bản hoàn chỉnh. Gõ trực tiếp trên đoạn văn.</p>
  </div>

  <div class="focus-controls">
    <button type="button" class="focus-toggle" aria-pressed={focusMode} onclick={toggleFocusMode}>
      {focusMode ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung'}
    </button>

    {#if focusMode}
      <span class="focus-hint">Nhấn Esc để thoát.</span>
    {/if}
  </div>

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
          <span class="completed-label">✓ Đã xong</span>
        {/if}
      </button>
    {/each}
  </div>

  <section class="practice" aria-label="Bài luyện hiện tại">
    <div class="practice-heading">
      <div>
        <span class="level-label">
          Bài {currentIndex + 1}/{LEARNING_LESSONS.length}
        </span>
        <h3>{currentLesson.title}</h3>
      </div>
    </div>

    <p class="lesson-description">{currentLesson.description}</p>

    <div class="metrics">
      <span>Đúng: <strong>{metrics.correctChars}</strong></span>
      <span>Sai: <strong>{metrics.incorrectChars}</strong></span>
      <span>Chính xác: <strong>{metrics.accuracy}%</strong></span>
      <span>Tiến độ: <strong>{progress}%</strong></span>
    </div>

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

    <div class="text-box">
      <TypingText text={currentLesson.text} typed={typedText} />

      <label for="learning-input" class="typing-target">
        <span class="visually-hidden"> Nhấp vào văn bản để bắt đầu gõ </span>
      </label>

      <textarea
        bind:this={inputElement}
        id="learning-input"
        class="typing-capture"
        value={typedText}
        oninput={handleInput}
        onbeforeinput={handleBeforeInput}
        ondrop={(event) => event.preventDefault()}
        onkeydown={handleFocusKeydown}
        oncompositionstart={() => (isComposing = true)}
        oncompositionend={handleCompositionEnd}
        onpaste={(event) => event.preventDefault()}
        disabled={isComplete}
        spellcheck={false}
        autocomplete="off"
        autocapitalize="off"></textarea>
    </div>

    {#if !focusMode}
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
      <p class="storage-warning" role="alert">
        Không thể đọc hoặc lưu tiến độ trên trình duyệt này.
      </p>
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
</section>

<style>
  .learning {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    margin-top: var(--space-6);
  }

  .learning-heading h2,
  .practice-heading h3 {
    margin: 0 0 var(--space-2);
    color: var(--color-text);
  }

  .learning-heading h2 {
    font-size: var(--font-size-xl);
  }

  .learning-heading p,
  .lesson-description {
    margin: 0;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .lesson-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .lesson-choice {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    min-width: 0;
    text-align: left;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .lesson-choice:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .lesson-choice[aria-pressed='true'] {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .lesson-number {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-sm);
    background: var(--color-background);
    color: var(--color-primary);
  }

  .lesson-name {
    min-width: 0;
    flex: 1;
    font-size: var(--font-size-sm);
  }

  .completed-label {
    color: var(--color-success);
    font-size: var(--font-size-xs);
    white-space: nowrap;
  }

  .practice {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .level-label {
    color: var(--color-primary);
    font-size: var(--font-size-sm);
  }

  .practice-heading h3 {
    margin-top: var(--space-2);
    font-size: var(--font-size-xl);
  }

  .metrics {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .metrics strong {
    color: var(--color-text);
  }

  .progress-track {
    height: 7px;
    overflow: hidden;
    border-radius: var(--radius-full);
    background: var(--color-background);
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
    transition: width var(--transition-fast);
  }

  .text-box {
    position: relative;
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
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

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .reset-button {
    background: var(--color-background);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .reset-button:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  @media (max-width: 600px) {
    .lesson-list {
      grid-template-columns: 1fr;
    }

    .practice {
      padding: var(--space-4);
    }
  }

  /* =======================================
   LEARNING FOCUS MODE
======================================= */

  .learning {
    position: relative;
  }

  .focus-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .focus-toggle {
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
  }

  .focus-toggle:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .focus-toggle[aria-pressed='true'] {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-primary);
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

  .learning.focus-mode .text-box {
    min-height: 150px;
    border-color: var(--color-primary);
  }
</style>
