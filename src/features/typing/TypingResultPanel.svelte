<script lang="ts">
  import { SPEED_MARK_SECONDS, accuracyRemark, speedChartModel } from './result-summary';

  let {
    languageLabel,
    durationSeconds,
    wpm,
    accuracy,
    delta,
    marks,
    markSeconds = SPEED_MARK_SECONDS,
    mistakeText,
    onRetry,
    onPractice,
  }: {
    languageLabel: string;
    durationSeconds: number;
    wpm: number;
    accuracy: number;
    delta: number | null;
    marks: number[];
    markSeconds?: number;
    mistakeText: string;
    onRetry: () => void;
    onPractice: () => void;
  } = $props();

  const plot = { left: 36, top: 14, right: 8, bottom: 28, width: 360, height: 188 };

  let chart = $derived.by(() => {
    const model = speedChartModel(marks, markSeconds);
    const count = model.points.length;
    const plotWidth = plot.width - plot.left - plot.right;
    const plotHeight = plot.height - plot.top - plot.bottom;

    const xAt = (index: number) =>
      count <= 1 ? plot.left + plotWidth / 2 : plot.left + (index / (count - 1)) * plotWidth;
    const yAt = (value: number) => plot.top + plotHeight - (value / model.maxWpm) * plotHeight;

    const dots = model.points.map((point, index) => ({
      ...point,
      x: xAt(index),
      y: yAt(point.wpm),
      showLabel: index % model.labelEvery === 0 || index === count - 1,
    }));

    return {
      dots,
      line: dots.map((dot) => `${dot.x},${dot.y}`).join(' '),
      grids: model.yTicks.map((tick) => ({ tick, y: yAt(tick) })),
      label: dots.map((dot) => `${dot.second} giây ${dot.wpm} WPM`).join(', '),
    };
  });

  let remark = $derived(accuracyRemark(accuracy));
</script>

<section class="result-panel" aria-labelledby="result-heading">
  <div class="result-heading">
    <div>
      <h2 id="result-heading">Kết quả luyện gõ</h2>
      <p>{languageLabel} · {durationSeconds} giây</p>
    </div>
    <svg class="done" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M8 12.5 11 15.5 16.5 9"></path>
    </svg>
  </div>

  <div class="result-stats">
    <div>
      <span class="stat-label">Tốc độ gõ</span>
      <p class="stat-value"><strong>{wpm}</strong> <span>WPM</span></p>
      {#if delta !== null}
        <p class="delta" class:up={delta > 0} class:down={delta < 0}>
          {#if delta > 0}
            +{delta} WPM so với lần trước
          {:else if delta < 0}
            {delta} WPM so với lần trước
          {:else}
            Bằng lần trước
          {/if}
        </p>
      {/if}
    </div>
    <div>
      <span class="stat-label">Độ chính xác</span>
      <p class="stat-value"><strong>{accuracy}</strong><span>%</span></p>
      <p class="remark">{remark}</p>
    </div>
  </div>

  {#if chart.dots.length > 1}
    <div class="chart-heading">
      <h3>Tốc độ trong bài kiểm tra</h3>
      <span>WPM</span>
    </div>
    <svg class="chart" viewBox="0 0 {plot.width} {plot.height}" role="img" aria-label={chart.label}>
      {#each chart.grids as grid (grid.tick)}
        <line
          x1={plot.left}
          x2={plot.width - plot.right}
          y1={grid.y}
          y2={grid.y}
          stroke="var(--color-border)"
        ></line>
        <text x="28" y={grid.y + 4} text-anchor="end">{grid.tick}</text>
      {/each}
      <polyline points={chart.line} fill="none"></polyline>
      {#each chart.dots as dot (dot.second)}
        <circle cx={dot.x} cy={dot.y} r="3.5"></circle>
        {#if dot.showLabel}
          <text class="x-label" x={dot.x} y={plot.height - 8} text-anchor="middle"
            >{dot.second}s</text
          >
        {/if}
      {/each}
    </svg>
  {/if}

  <div class="result-actions">
    <button type="button" class="retry" onclick={onRetry}>Thử lại</button>
    {#if mistakeText}
      <button type="button" class="practice" onclick={onPractice}>Luyện lỗi sai →</button>
    {/if}
  </div>
</section>

<style>
  .result-panel {
    width: 100%;
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .result-heading,
  .chart-heading,
  .result-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .result-heading h2,
  .chart-heading h3,
  .stat-value,
  .delta,
  .remark,
  .result-heading p {
    margin: 0;
  }

  .result-heading h2 {
    font-size: var(--font-size-lg);
    line-height: 1.3;
  }

  .result-heading p,
  .stat-label,
  .chart-heading,
  .remark {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .done {
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    color: var(--color-success);
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .result-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }

  .stat-value {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .stat-value strong {
    color: var(--color-text);
    font-size: clamp(32px, 4vw, 44px);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    line-height: 1;
  }

  .delta,
  .remark {
    margin-top: var(--space-2);
  }

  .delta.up {
    color: var(--color-success);
  }

  .delta.down {
    color: var(--color-error);
  }

  .chart-heading {
    margin-top: var(--space-5);
  }

  .chart-heading h3 {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .chart {
    display: block;
    width: 100%;
    height: auto;
    margin-top: var(--space-3);
    color: var(--color-text-muted);
    font-size: 11px;
    font-family: inherit;
  }

  .chart polyline {
    stroke: var(--color-primary);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .chart circle {
    fill: var(--color-primary);
  }

  .chart text {
    fill: currentColor;
  }

  .result-actions {
    justify-content: flex-start;
    margin-top: var(--space-5);
  }

  .retry,
  .practice {
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
  }

  .retry {
    flex: 1 1 220px;
    max-width: 360px;
    background: var(--color-surface-hover);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .retry:hover:not(:disabled),
  .retry:focus-visible {
    background: var(--color-border);
    color: var(--color-text);
  }

  .practice {
    background: transparent;
    color: var(--color-text);
  }

  .practice:hover:not(:disabled),
  .practice:focus-visible {
    background: transparent;
    color: var(--color-primary);
  }

  @media (max-width: 700px) {
    .result-panel {
      padding: var(--space-4);
    }

    .retry {
      max-width: none;
    }
  }
</style>
