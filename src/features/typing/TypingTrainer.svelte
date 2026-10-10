<script lang="ts">
  import { onMount, tick } from 'svelte';
  import TypingText from './TypingText.svelte';
  import TypingHistory from './TypingHistory.svelte';
  import TypingSettings from './TypingSettings.svelte';

  import { MAX_RESULTS, loadTypingHistory, saveTypingHistory, type TypingResult } from './storage';
  import { hydrateTypingSettings, subscribeTypingSettings } from './typing-settings';
  import { playCommittedTypingSound } from './typing-sound';
  import VirtualKeyboard from './VirtualKeyboard.svelte';

  import { normalizeTypingText, splitGraphemes } from './typing-engine';

  import { calculateTypingMetrics } from './metrics';
  import { LESSONS, buildContinuousLessonText, type LessonLanguage } from './lessons';

  const DURATIONS = [15, 30, 60, 120] as const;

  type DurationSeconds = (typeof DURATIONS)[number];
  type Status = 'idle' | 'running' | 'finished';

  let selectedDuration = $state<DurationSeconds>(60);
  let selectedLanguage = $state<LessonLanguage>('vi');
  let selectedLessonId = $state('vi-basic');
  // Số đoạn văn đã được bổ sung trong phiên luyện.
  let continuationCount = $state(0);

  // Nạp thêm nội dung khi còn 50 ký tự.
  const LOAD_AHEAD = 50;

  let typedText = $state('');
  let elapsedMs = $state(0);
  let status = $state<Status>('idle');
  // Chế độ luyện gõ tập trung
  let focusMode = $state(false);
  let showKeyboard = $state(true);
  let history = $state<TypingResult[]>([]);
  let storageWarning = $state(false);

  let inputElement: HTMLTextAreaElement;
  let startedAt: number | null = null;
  let timerId: number | undefined;
  let isComposing = false;

  // Bài luyện hiện tại
  let availableLessons = $derived(LESSONS.filter((lesson) => lesson.language === selectedLanguage));

  let currentLesson = $derived(
    LESSONS.find((lesson) => lesson.id === selectedLessonId) ?? LESSONS[0],
  );

  let sampleText = $derived(buildContinuousLessonText(currentLesson, continuationCount));
  let totalChars = $derived(splitGraphemes(sampleText).length);

  // Thời gian và thống kê
  let durationMs = $derived(selectedDuration * 1000);

  let metrics = $derived(calculateTypingMetrics(sampleText, typedText, elapsedMs));

  let remainingSeconds = $derived(Math.ceil(Math.max(0, durationMs - elapsedMs) / 1000));

  // Danh sách ký tự của bài luyện hiện tại
  let lessonCharacters = $derived(splitGraphemes(sampleText));

  // Xác định ký tự/phím tiếp theo cần hướng dẫn
  let nextCharacter = $derived(
    status === 'finished'
      ? null
      : (lessonCharacters[metrics.typedChars] ?? (typedText !== sampleText ? '\b' : null)),
  );

  function stopTimer() {
    if (timerId !== undefined) {
      window.clearInterval(timerId);
      timerId = undefined;
    }
  }

  function finishTyping() {
    if (status === 'finished') return;

    status = 'finished';
    stopTimer();

    // Không lưu phiên chưa bắt đầu.
    if (startedAt === null || typedText.length === 0) {
      return;
    }

    const finalMetrics = calculateTypingMetrics(sampleText, typedText, elapsedMs);

    const result: TypingResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lessonId: currentLesson.id,
      language: selectedLanguage,
      durationSeconds: selectedDuration,
      elapsedMs,
      wpm: finalMetrics.wpm,
      accuracy: finalMetrics.accuracy,
      correctChars: finalMetrics.correctChars,
      incorrectChars: finalMetrics.incorrectChars,
      completed: false,
    };

    history = [result, ...history].slice(0, MAX_RESULTS);

    storageWarning = !saveTypingHistory(history);
  }

  function updateClock(): boolean {
    if (startedAt === null || status !== 'running') {
      return false;
    }

    elapsedMs = Math.min(performance.now() - startedAt, durationMs);

    if (elapsedMs < durationMs) {
      return false;
    }

    finishTyping();
    return true;
  }

  function startTimer() {
    if (startedAt !== null) return;

    startedAt = performance.now();
    status = 'running';

    timerId = window.setInterval(updateClock, 100);
  }

  function updateTyping(value: string) {
    if (status === 'finished') return;

    const expected = sampleText;
    const normalized = normalizeTypingText(value);
    const inputChars = splitGraphemes(normalized);

    // Khi sắp gõ hết văn bản, tự động nối thêm đoạn mới.
    if (inputChars.length >= totalChars - LOAD_AHEAD) {
      continuationCount += 1;
    }

    // Không cho nhập vượt quá lượng văn bản hiện có.
    const nextText = inputChars.slice(0, totalChars).join('');

    // Bắt đầu tính giờ khi nhập ký tự đầu tiên.
    if (startedAt === null && nextText.length > 0) {
      startTimer();
    }

    // Nếu thời gian vừa kết thúc, bỏ thao tác nhập mới.
    if (updateClock()) {
      inputElement.value = typedText;
      return;
    }

    if (nextText !== typedText) {
      playCommittedTypingSound(typedText, nextText, expected);
    }

    typedText = nextText;

    if (inputElement.value !== nextText) {
      inputElement.value = nextText;
    }

    // Không kết thúc khi gõ hết đoạn văn:
    // phiên luyện chỉ kết thúc khi hết thời gian.
  }

  function handleInput(event: Event) {
    const inputEvent = event as InputEvent;

    // Không cập nhật khi IME vẫn đang ghép ký tự.
    if (isComposing || inputEvent.isComposing) {
      return;
    }

    const target = event.currentTarget as HTMLTextAreaElement;

    updateTyping(target.value);
  }

  // Không cho dán hoặc kéo thả văn bản vào bài kiểm tra.
  function handleBeforeInput(event: InputEvent) {
    if (event.inputType.startsWith('insertFromPaste') || event.inputType === 'insertFromDrop') {
      event.preventDefault();
    }
  }

  function handleCompositionStart() {
    isComposing = true;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    isComposing = false;

    const target = event.currentTarget as HTMLTextAreaElement;
    updateTyping(target.value);
  }

  async function toggleFocusMode() {
    focusMode = !focusMode;

    await tick();

    // Tự động đưa con trỏ vào ô nhận phím.
    if (status !== 'finished') {
      inputElement?.focus();
    }
  }

  function handleFocusKeydown(event: KeyboardEvent) {
    // Nhấn Esc để thoát Focus Mode.
    // Không can thiệp khi bộ gõ tiếng Việt đang xử lý IME.
    if (event.key === 'Escape' && focusMode && !isComposing) {
      focusMode = false;
    }
  }

  async function resetTyping() {
    stopTimer();
    continuationCount = 0;

    startedAt = null;
    isComposing = false;

    typedText = '';
    elapsedMs = 0;
    status = 'idle';

    await tick();

    inputElement.value = '';
    inputElement.focus();
  }

  function changeDuration(duration: DurationSeconds) {
    if (selectedDuration === duration) return;

    selectedDuration = duration;
    void resetTyping();
  }

  function changeLanguage(event: Event) {
    const language = (event.currentTarget as HTMLSelectElement).value;

    if (language !== 'vi' && language !== 'en') return;

    selectedLanguage = language;

    selectedLessonId = LESSONS.find((lesson) => lesson.language === language)?.id ?? LESSONS[0].id;

    void resetTyping();
  }

  function changeLesson(event: Event) {
    const lessonId = (event.currentTarget as HTMLSelectElement).value;

    if (!availableLessons.some((lesson) => lesson.id === lessonId)) {
      return;
    }

    selectedLessonId = lessonId;
    void resetTyping();
  }

  function clearHistory() {
    const confirmed = window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử luyện gõ không?');

    if (!confirmed) return;

    if (saveTypingHistory([])) {
      history = [];
      storageWarning = false;
    } else {
      storageWarning = true;
    }
  }

  onMount(() => {
    hydrateTypingSettings();
    const stopSettings = subscribeTypingSettings((settings) => {
      showKeyboard = settings.keyboard;
    });

    history = loadTypingHistory();
    inputElement?.focus();
    window.addEventListener('focus', updateClock);
    document.addEventListener('visibilitychange', updateClock);

    return () => {
      stopSettings();
      stopTimer();
      window.removeEventListener('focus', updateClock);
      document.removeEventListener('visibilitychange', updateClock);
    };
  });
</script>

<section class="trainer" class:focus-mode={focusMode}>
  <div class="toolbar">
    <div class="toolbar-config">
      <div class="field">
        <label class="visually-hidden" for="language">Ngôn ngữ</label>
        <select id="language" value={selectedLanguage} onchange={changeLanguage}>
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div class="field">
        <label class="visually-hidden" for="lesson">Bài luyện</label>
        <select id="lesson" value={selectedLessonId} onchange={changeLesson}>
          {#each availableLessons as lesson (lesson.id)}
            <option value={lesson.id}>{lesson.title}</option>
          {/each}
        </select>
      </div>

      <fieldset class="duration-picker">
        <legend class="visually-hidden">Thời gian luyện</legend>
        <div class="duration-options">
          {#each DURATIONS as seconds (seconds)}
            <button
              type="button"
              class="duration-button"
              aria-pressed={selectedDuration === seconds}
              onclick={() => changeDuration(seconds)}
            >
              {seconds}s
            </button>
          {/each}
        </div>
      </fieldset>
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

  <p class="stats-line">
    <span><strong>{metrics.wpm}</strong> WPM</span>
    <span><strong>{metrics.accuracy}%</strong> chính xác</span>
    <span><strong>{remainingSeconds}s</strong> còn lại</span>
  </p>

  <div class="stage">
    <label for="typing-input" class="typing-target">
      <span class="visually-hidden"> Nhấp vào văn bản để bắt đầu gõ </span>
    </label>
    <div class="text-box">
      <TypingText text={sampleText} typed={typedText} />

      <textarea
        bind:this={inputElement}
        id="typing-input"
        class="typing-capture"
        value={typedText}
        oninput={handleInput}
        onbeforeinput={handleBeforeInput}
        ondrop={(event) => event.preventDefault()}
        onkeydown={handleFocusKeydown}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        onpaste={(event) => event.preventDefault()}
        disabled={status === 'finished'}
        spellcheck={false}
        autocomplete="off"
        autocapitalize="off"></textarea>
    </div>
  </div>

  <!-- Bàn phím ảo hướng dẫn gõ 10 ngón -->
  {#if showKeyboard && !focusMode}
    <VirtualKeyboard {nextCharacter} />
  {/if}

  <!-- Tiến độ và nút làm lại -->
  <div class="bottom-bar">
    <div class="progress">
      <span>Đúng: {metrics.correctChars}</span>
      <span>Sai: {metrics.incorrectChars}</span>
      <span>Tiến độ: {metrics.typedChars}/{totalChars}</span>
    </div>

    <button type="button" class="restart" onclick={resetTyping}>Làm lại</button>
  </div>

  <!-- Kết quả -->
  {#if status === 'finished'}
    <div class="result" role="status">
      <h3>Đã hết thời gian!</h3>

      <p>
        Kết quả: {metrics.wpm} WPM — Độ chính xác {metrics.accuracy}%
      </p>
    </div>
  {/if}
  {#if storageWarning}
    <p class="storage-warning" role="alert">
      Không thể lưu lịch sử vào trình duyệt. Kết quả có thể mất khi tải lại trang.
    </p>
  {/if}

  {#if !focusMode}
    <TypingHistory
      results={history}
      lessonId={selectedLessonId}
      durationSeconds={selectedDuration}
      onClear={clearHistory}
    />
  {/if}
</section>

<style>
  .trainer {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-5);
  }

  .toolbar,
  .toolbar-config,
  .focus-controls,
  .duration-options,
  .stats-line,
  .bottom-bar,
  .progress {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .toolbar,
  .stats-line,
  .bottom-bar {
    justify-content: center;
  }

  .field {
    min-width: 0;
  }

  select {
    max-width: 240px;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    font: inherit;
    font-size: var(--font-size-sm);
    cursor: pointer;
  }

  select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .duration-picker {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .duration-button,
  .focus-toggle,
  .restart {
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .duration-button:hover:not(:disabled),
  .focus-toggle:hover:not(:disabled),
  .restart:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }

  .duration-button[aria-pressed='true'],
  .focus-toggle[aria-pressed='true'] {
    background: var(--color-primary-soft);
    color: var(--color-primary);
  }

  .stats-line {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .stats-line strong {
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .stage {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    min-height: clamp(220px, 36vh, 460px);
  }

  .text-box {
    position: relative;
    width: 100%;
    padding: var(--space-2) 0;
    cursor: text;
  }

  .progress {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .result {
    padding: var(--space-5);
    background: var(--color-success-soft);
    border-radius: var(--radius-md);
    color: var(--color-success);
  }

  .result h3 {
    margin: 0 0 var(--space-2);
  }

  .result p {
    margin: 0;
  }

  @media (max-width: 600px) {
    select {
      max-width: 100%;
    }
  }

  .storage-warning {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    background: var(--color-error-soft);
    color: var(--color-error);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
  }

  /* =======================================
   FOCUS MODE
======================================= */

  .focus-hint {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .trainer.focus-mode .toolbar-config {
    display: none;
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
</style>
