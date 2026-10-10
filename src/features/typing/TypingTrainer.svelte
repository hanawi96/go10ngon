<script lang="ts">
  import { onMount, tick } from 'svelte';
import TypingText from './TypingText.svelte';
import TypingHistory from './TypingHistory.svelte';

import {
  MAX_RESULTS,
  loadTypingHistory,
  saveTypingHistory,
  type TypingResult,
} from './storage';
import VirtualKeyboard from './VirtualKeyboard.svelte';

  import {
    normalizeTypingText,
    splitGraphemes,
  } from './typing-engine';

  import { calculateTypingMetrics } from './metrics';
import {
  LESSONS,
  buildContinuousLessonText,
  type LessonLanguage,
} from './lessons';

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
    let history = $state<TypingResult[]>([]);
let storageWarning = $state(false);

  let inputElement: HTMLTextAreaElement;
  let startedAt: number | null = null;
  let timerId: number | undefined;
  let isComposing = false;

  // Bài luyện hiện tại
  let availableLessons = $derived(
    LESSONS.filter((lesson) => lesson.language === selectedLanguage),
  );

  let currentLesson = $derived(
    LESSONS.find((lesson) => lesson.id === selectedLessonId) ??
      LESSONS[0],
  );

let sampleText = $derived(
  buildContinuousLessonText(currentLesson, continuationCount),
);
  let totalChars = $derived(splitGraphemes(sampleText).length);

  // Thời gian và thống kê
  let durationMs = $derived(selectedDuration * 1000);

  let metrics = $derived(
    calculateTypingMetrics(sampleText, typedText, elapsedMs),
  );

  let remainingSeconds = $derived(
    Math.ceil(Math.max(0, durationMs - elapsedMs) / 1000),
  );


  // Danh sách ký tự của bài luyện hiện tại
let lessonCharacters = $derived(splitGraphemes(sampleText));

// Xác định ký tự/phím tiếp theo cần hướng dẫn
let nextCharacter = $derived(
  status === 'finished'
    ? null
    : (lessonCharacters[metrics.typedChars] ??
      (typedText !== sampleText ? '\b' : null)),
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

  const finalMetrics = calculateTypingMetrics(
    sampleText,
    typedText,
    elapsedMs,
  );

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

  function updateClock() {
    if (startedAt === null || status !== 'running') {
      return;
    }

    elapsedMs = Math.min(
      performance.now() - startedAt,
      durationMs,
    );

    if (elapsedMs >= durationMs) {
      finishTyping();
    }
  }

  function startTimer() {
    if (startedAt !== null) return;

    startedAt = performance.now();
    status = 'running';

    timerId = window.setInterval(updateClock, 100);
  }

  function updateTyping(value: string) {
  if (status === 'finished') return;

  const normalized = normalizeTypingText(value);
  const inputChars = splitGraphemes(normalized);

  // Khi sắp gõ hết văn bản, tự động nối thêm đoạn mới.
  if (inputChars.length >= totalChars - LOAD_AHEAD) {
    continuationCount += 1;
  }

  // Không cho nhập vượt quá lượng văn bản hiện có.
  const nextText = inputChars
    .slice(0, totalChars)
    .join('');

  // Bắt đầu tính giờ khi nhập ký tự đầu tiên.
  if (startedAt === null && nextText.length > 0) {
    startTimer();
  }

  if (status === 'running') {
    updateClock();
  }

  // Nếu thời gian vừa kết thúc, bỏ thao tác nhập mới.
  if (status === 'finished') {
    inputElement.value = typedText;
    return;
  }

  typedText = nextText;

  if (inputElement.value !== nextText) {
    inputElement.value = nextText;
  }

  // Không kết thúc khi gõ hết đoạn văn:
  // phiên luyện chỉ kết thúc khi hết thời gian.
}

  function handleInput(event: Event) {
    if (isComposing) return;

    const target = event.currentTarget as HTMLTextAreaElement;
    updateTyping(target.value);
  }

  function handleCompositionStart() {
    isComposing = true;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    isComposing = false;

    const target = event.currentTarget as HTMLTextAreaElement;
    updateTyping(target.value);
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

    selectedLessonId =
      LESSONS.find((lesson) => lesson.language === language)?.id ??
      LESSONS[0].id;

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
  const confirmed = window.confirm(
    'Bạn có chắc muốn xóa toàn bộ lịch sử luyện gõ không?',
  );

  if (!confirmed) return;

  if (saveTypingHistory([])) {
    history = [];
    storageWarning = false;
  } else {
    storageWarning = true;
  }
}

  onMount(() => {
    history = loadTypingHistory();
    window.addEventListener('focus', updateClock);
    document.addEventListener('visibilitychange', updateClock);

    return () => {
      stopTimer();
      window.removeEventListener('focus', updateClock);
      document.removeEventListener('visibilitychange', updateClock);
    };
  });
</script>

<section class="trainer">
  <header class="trainer-header">
    <h2>Luyện gõ 10 ngón</h2>
    <p>Chọn bài luyện và thời gian phù hợp để bắt đầu.</p>
  </header>

  <!-- Lựa chọn ngôn ngữ và bài luyện -->
  <div class="settings">
    <div class="field">
      <label for="language">Ngôn ngữ</label>

      <select
        id="language"
        value={selectedLanguage}
        onchange={changeLanguage}
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </div>

    <div class="field">
      <label for="lesson">Bài luyện</label>

      <select
        id="lesson"
        value={selectedLessonId}
        onchange={changeLesson}
      >
        {#each availableLessons as lesson (lesson.id)}
          <option value={lesson.id}>{lesson.title}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Lựa chọn thời gian -->
  <fieldset class="duration-picker">
    <legend>Thời gian luyện</legend>

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

  <!-- Thống kê -->
  <div class="stats">
    <div class="stat">
      <span class="stat-value">{metrics.wpm}</span>
      <span class="stat-label">WPM</span>
    </div>

    <div class="stat">
      <span class="stat-value">{metrics.accuracy}%</span>
      <span class="stat-label">Chính xác</span>
    </div>

    <div class="stat">
      <span class="stat-value">{remainingSeconds}s</span>
      <span class="stat-label">Còn lại</span>
    </div>
  </div>

  <!-- Văn bản luyện gõ -->
<div class="text-box">
  <TypingText text={sampleText} typed={typedText} />
</div>

<!-- Bàn phím ảo hướng dẫn gõ 10 ngón -->
<VirtualKeyboard nextCharacter={nextCharacter} />

  <!-- Ô nhập văn bản -->
  <div class="input-section">
    <label for="typing-input">Nhập văn bản tại đây</label>

    <textarea
      bind:this={inputElement}
      id="typing-input"
      rows="3"
      value={typedText}
      oninput={handleInput}
      oncompositionstart={handleCompositionStart}
      oncompositionend={handleCompositionEnd}
      onpaste={(event) => event.preventDefault()}
      disabled={status === 'finished'}
      placeholder="Bắt đầu gõ để tính thời gian..."
      spellcheck={false}
      autocomplete="off"
      autocapitalize="off"
    ></textarea>
  </div>

  <!-- Tiến độ và nút làm lại -->
  <div class="bottom-bar">
    <div class="progress">
      <span>Đúng: {metrics.correctChars}</span>
      <span>Sai: {metrics.incorrectChars}</span>
      <span>Tiến độ: {metrics.typedChars}/{totalChars}</span>
    </div>

    <button type="button" onclick={resetTyping}>
      Làm lại
    </button>
  </div>

  <!-- Kết quả -->
  {#if status === 'finished'}
    <div class="result" role="status">
      <h3>Đã hết thời gian!</h3>

      <p>
        Kết quả: {metrics.wpm} WPM —
        Độ chính xác {metrics.accuracy}%
      </p>
    </div>
  {/if}
  {#if storageWarning}
  <p class="storage-warning" role="alert">
    Không thể lưu lịch sử vào trình duyệt.
    Kết quả có thể mất khi tải lại trang.
  </p>
{/if}

<TypingHistory
  results={history}
  lessonId={selectedLessonId}
  durationSeconds={selectedDuration}
  onClear={clearHistory}
/>
</section>

<style>
  .trainer {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    margin-top: var(--space-6);
  }

  .trainer-header h2 {
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-xl);
    color: var(--color-text);
  }

  .trainer-header p {
    margin: 0;
    color: var(--color-text-muted);
  }

  .settings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .field label,
  .duration-picker legend {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  select {
    width: 100%;
    min-width: 0;
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font: inherit;
    cursor: pointer;
  }

  select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .duration-picker {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  .duration-picker legend {
    margin-bottom: var(--space-3);
  }

  .duration-options {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .duration-button {
    min-width: 65px;
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .duration-button:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .duration-button[aria-pressed='true'] {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .stat-value {
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-primary);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .text-box {
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .input-section label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  textarea {
    width: 100%;
    padding: var(--space-4);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    font: inherit;
    font-size: var(--font-size-lg);
    line-height: 1.6;
    resize: vertical;
    outline: none;
  }

  textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-focus-ring);
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  textarea::placeholder {
    color: var(--color-text-muted);
  }

  .bottom-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }

  .progress {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
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
    .settings {
      grid-template-columns: 1fr;
    }

    .text-box {
      padding: var(--space-4);
    }

    .bottom-bar {
      flex-direction: column;
      align-items: stretch;
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
</style>