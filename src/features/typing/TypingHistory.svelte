
<script lang="ts">
  import { LESSONS } from './lessons';
  import type { TypingResult } from './storage';

  interface Props {
    results: TypingResult[];
    lessonId: string;
    durationSeconds: number;
    onClear: () => void;
  }

  let { results, lessonId, durationSeconds, onClear }: Props = $props();

  // Chỉ so sánh kỷ lục cùng bài luyện và thời lượng.
  let matchingResults = $derived(
    results.filter(
      (item) =>
        item.lessonId === lessonId &&
        item.durationSeconds === durationSeconds,
    ),
  );

  let bestResult = $derived(
    matchingResults.reduce<TypingResult | null>(
      (best, item) => (!best || item.wpm > best.wpm ? item : best),
      null,
    ),
  );

  let recentResults = $derived(results.slice(0, 8));

  function getLessonTitle(id: string): string {
    return LESSONS.find((lesson) => lesson.id === id)?.title ?? id;
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<section class="history" aria-labelledby="history-heading">
  <div class="history-header">
    <div>
      <h3 id="history-heading">Lịch sử luyện gõ</h3>
      <p>Thành tích được lưu trên trình duyệt này.</p>
    </div>

    {#if results.length > 0}
      <button type="button" class="clear-button" onclick={onClear}>
        Xóa lịch sử
      </button>
    {/if}
  </div>

  <div class="best-result">
    <div>
      <span class="best-label">Kỷ lục WPM của bài đang chọn</span>
      <strong class="best-value">
        {bestResult ? `${bestResult.wpm} WPM` : 'Chưa có'}
      </strong>
    </div>

    {#if bestResult}
      <span class="best-accuracy">
        Chính xác {bestResult.accuracy}%
      </span>
    {/if}
  </div>

  {#if results.length === 0}
    <p class="empty">
      Chưa có kết quả nào. Hãy hoàn thành một lần luyện gõ
      để bắt đầu lưu thành tích.
    </p>
  {:else}
    <h4>8 lần luyện gần nhất</h4>

    <div class="history-list">
      {#each recentResults as result (result.id)}
        <div class="history-item">
          <div class="item-info">
            <strong>{getLessonTitle(result.lessonId)}</strong>
            <time datetime={result.createdAt}>
              {formatDate(result.createdAt)}
            </time>
          </div>

          <div class="item-metrics">
            <strong>{result.wpm} WPM</strong>
            <span>{result.accuracy}%</span>
          </div>

          <div class="item-status">
            {result.completed ? 'Hoàn thành' : 'Hết giờ'}
            · {result.durationSeconds}s
          </div>
        </div>
      {/each}
    </div>

    <p class="history-note">
      Hiển thị 8 kết quả mới nhất, lưu tối đa 50 kết quả.
    </p>
  {/if}
</section>

<style>
  .history {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);

    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .history-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .history-header h3 {
    margin: 0 0 var(--space-2);
    color: var(--color-text);
    font-size: var(--font-size-lg);
  }

  .history-header p,
  .history-note {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .clear-button {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-3);
    background: var(--color-background);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
  }

  .clear-button:hover {
    background: var(--color-surface-hover);
  }

  .best-result {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .best-result > div {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .best-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .best-value {
    color: var(--color-primary);
    font-size: var(--font-size-xl);
  }

  .best-accuracy {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  h4 {
    margin: var(--space-2) 0 0;
    color: var(--color-text);
    font-size: var(--font-size-md);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }

  .item-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .item-info strong {
    color: var(--color-text);
    font-size: var(--font-size-sm);
  }

  .item-info time,
  .item-status {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }

  .item-metrics {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
    white-space: nowrap;
  }

  .item-metrics strong {
    color: var(--color-primary);
    font-size: var(--font-size-md);
  }

  .item-metrics span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .item-status {
    white-space: nowrap;
  }

  .empty {
    margin: 0;
    padding: var(--space-4);
    text-align: center;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  @media (max-width: 600px) {
    .history {
      padding: var(--space-4);
    }

    .history-header,
    .best-result {
      align-items: flex-start;
      flex-direction: column;
    }

    .history-item {
      flex-wrap: wrap;
    }

    .item-status {
      width: 100%;
    }
  }
</style>
