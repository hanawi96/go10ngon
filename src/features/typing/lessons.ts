export type LessonLanguage = 'vi' | 'en';

export interface TypingLesson {
  id: string;
  language: LessonLanguage;
  title: string;
  text: string;
}

export const LESSONS: TypingLesson[] = [
  {
    id: 'vi-basic',
    language: 'vi',
    title: 'Cơ bản - Luyện gõ hằng ngày',
    text:
      'Mỗi ngày chúng ta nên dành một chút thời gian để luyện gõ bàn phím. ' +
      'Khi mới bắt đầu, bạn hãy gõ thật chậm và chú ý đến độ chính xác. ' +
      'Đặt hai tay đúng vị trí, giữ tư thế ngồi thoải mái và cố gắng không nhìn xuống bàn phím. ' +
      'Sau một thời gian luyện tập đều đặn, các ngón tay sẽ trở nên linh hoạt hơn. ' +
      'Bạn sẽ có thể nhập văn bản nhanh hơn mà không cần suy nghĩ quá nhiều về vị trí từng phím.',
  },
  {
    id: 'vi-advanced',
    language: 'vi',
    title: 'Nâng cao - Văn bản có dấu câu',
    text:
      'Kỹ năng đánh máy là một phần quan trọng trong công việc hiện đại. ' +
      'Bạn có thể viết email, soạn báo cáo, nhập dữ liệu và xử lý tài liệu nhanh chóng hơn. ' +
      'Tuy nhiên, tốc độ không phải là yếu tố duy nhất! ' +
      'Hãy chú ý đến dấu phẩy, dấu chấm, dấu hỏi và những ký tự thường gặp. ' +
      'Ví dụ: Một nhân viên nhập 100 dòng dữ liệu mỗi ngày cần đảm bảo cả tốc độ lẫn độ chính xác. ' +
      'Đừng vội vàng; hãy luyện tập thường xuyên để cải thiện từng ngày.',
  },
  {
    id: 'en-basic',
    language: 'en',
    title: 'Basic - Everyday typing',
    text:
      'Learning to type is a useful skill for everyone. ' +
      'Start slowly and focus on typing each word correctly. ' +
      'Keep your hands in a comfortable position and try not to look at the keyboard. ' +
      'Practice a little every day to improve your speed and accuracy. ' +
      'With enough practice, your fingers will remember where the keys are. ' +
      'Soon you will be able to type longer sentences with more confidence and fewer mistakes.',
  },
  {
    id: 'en-advanced',
    language: 'en',
    title: 'Advanced - Punctuation and numbers',
    text:
      'Good typing skills can make your daily work faster and easier. ' +
      'For example, a report may contain 25 pages, 120 entries, and several important dates. ' +
      'Can you type each sentence without making a mistake? ' +
      'Remember to use commas, periods, question marks, and capital letters correctly. ' +
      'Speed is important, but accuracy matters just as much! ' +
      'Focus on each word, develop a steady rhythm, and continue practicing every day.',
  },
];

// Các đoạn văn bổ sung cho chế độ luyện gõ liên tục.
// Mỗi bài luyện có nội dung nối tiếp riêng.

const CONTINUATION_TEXTS: Record<string, string[]> = {
  'vi-basic': [
    'Các ngón tay cần được đặt đúng vị trí trên bàn phím. Hãy bắt đầu bằng những từ đơn giản và tăng dần tốc độ khi đã quen. Việc luyện tập đều đặn sẽ giúp bạn đánh máy tự nhiên hơn.',

    'Mỗi buổi luyện tập là một cơ hội để cải thiện kỹ năng. Bạn không cần gõ thật nhanh ngay từ đầu. Điều quan trọng là giữ được nhịp điệu ổn định và hạn chế những lỗi không cần thiết.',

    'Khi đã quen với vị trí các phím, bạn sẽ không phải nhìn bàn phím thường xuyên. Hãy kiên nhẫn luyện tập và tập trung vào từng câu chữ để nâng cao kỹ năng đánh máy mỗi ngày.',
  ],

  'vi-advanced': [
    'Trong công việc văn phòng, tốc độ nhập liệu và độ chính xác đều rất quan trọng. Một báo cáo có thể chứa 125 dòng dữ liệu, 36 con số và nhiều dấu câu khác nhau. Bạn có thể hoàn thành mà không mắc lỗi không?',

    'Luyện gõ nâng cao đòi hỏi sự tập trung! Hãy thử nhập các con số như 2026, 135 và 789; sau đó tiếp tục với dấu phẩy, dấu chấm, dấu hai chấm và dấu chấm hỏi. Độ chính xác luôn là ưu tiên hàng đầu.',

    'Một người đánh máy thành thạo không chỉ biết gõ nhanh mà còn phải duy trì sự ổn định. Ví dụ: Hoàn thành 150 từ trong 2 phút với độ chính xác 98% là một mục tiêu đáng để luyện tập.',
  ],

  'en-basic': [
    'Typing is a skill that improves with regular practice. Keep your hands relaxed and pay attention to every letter. Try to develop a steady rhythm instead of rushing through each sentence.',

    'A comfortable sitting position can make typing easier. Keep your eyes on the screen and let your fingers find the correct keys. A little practice every day can make a big difference.',

    'Learning new skills takes time and patience. Start with simple words, continue with short sentences, and gradually move on to longer paragraphs. Focus on accuracy before speed.',
  ],

  'en-advanced': [
    'Professional typing requires both speed and precision. Imagine preparing a report with 250 entries, 45 categories, and 12 important deadlines. Every number and punctuation mark matters.',

    'Can you maintain your typing speed while using symbols such as commas, periods, colons, and question marks? Remember: A small mistake in an important document can change its meaning.',

    'The target is simple: Type 120 words in 60 seconds while maintaining at least 98% accuracy. However, consistency is often more valuable than achieving a high score just once.',
  ],
};

/**
 * Ghép thêm văn bản theo bài luyện đã chọn.
 * Giữ nguyên bài gốc và nối các đoạn mới khi cần.
 */
export function buildContinuousLessonText(
  lesson: TypingLesson,
  continuationCount: number,
): string {
  const availableTexts = CONTINUATION_TEXTS[lesson.id] ?? [];

  if (continuationCount <= 0 || availableTexts.length === 0) {
    return lesson.text;
  }

  const passages = [lesson.text];

  for (let index = 0; index < continuationCount; index++) {
    const nextText = availableTexts[index % availableTexts.length];

    passages.push(nextText);
  }

  return passages.join(' ');
}