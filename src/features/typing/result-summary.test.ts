import { describe, expect, it } from 'vitest';

import {
  accuracyRemark,
  findPreviousWpm,
  mistakeDrillText,
  speedChartModel,
} from './result-summary';

describe('Kết quả luyện gõ', () => {
  it('gọi tên mức chính xác', () => {
    expect(accuracyRemark(100)).toBe('Hoàn hảo');
    expect(accuracyRemark(96)).toBe('Rất tốt');
    expect(accuracyRemark(91)).toBe('Tốt');
    expect(accuracyRemark(64)).toBe('Cần cải thiện');
  });

  it('lấy WPM của lần trước cùng bài và cùng thời lượng', () => {
    const results = [
      { lessonId: 'vi-basic', durationSeconds: 30, wpm: 40 },
      { lessonId: 'vi-basic', durationSeconds: 15, wpm: 20 },
      { lessonId: 'en-basic', durationSeconds: 30, wpm: 70 },
    ];

    expect(findPreviousWpm(results, 'vi-basic', 30)).toBe(40);
    expect(findPreviousWpm(results, 'vi-basic', 60)).toBeNull();
  });

  it('dựng mốc tốc độ mỗi 5 giây', () => {
    const chart = speedChartModel([38, 46, 58]);

    expect(chart.points).toEqual([
      { second: 5, wpm: 38 },
      { second: 10, wpm: 46 },
      { second: 15, wpm: 58 },
    ]);
    expect(chart.maxWpm).toBe(60);
    expect(chart.yTicks).toEqual([60, 45, 30, 15, 0]);
    expect(chart.labelEvery).toBe(1);
  });

  it('đánh mốc từng giây cho bài thử 5 giây', () => {
    const chart = speedChartModel([10, 12, 14, 16, 18], 1);

    expect(chart.points.map((point) => point.second)).toEqual([1, 2, 3, 4, 5]);
  });

  it('chỉ gom từ đã gõ và còn sai', () => {
    expect(mistakeDrillText('xin chào bạn', 'xim')).toBe('xin');
    expect(mistakeDrillText('bắt đầu ngay', 'bắt đau')).toBe('đầu');
    expect(mistakeDrillText('xin chào', 'xin chào')).toBe('');
  });
});
