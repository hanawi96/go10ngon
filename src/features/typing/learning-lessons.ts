export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  text: string;
}

export const LEARNING_LESSONS: LearningLesson[] = [
  {
    id: 'home-basic',
    title: 'Hàng phím cơ sở',
    description:
      'Đặt hai ngón trỏ tại F và J. Luyện các phím A S D F J K L ; và cố gắng không nhìn bàn phím.',
    text:
      'asdf jkl; asdf jkl; fj dk sl a; ' +
      'asdf jkl; fj fj dk dk sl sl a; ' +
      'a; s; d; f; j; k; l;',
  },
  {
    id: 'home-extended',
    title: 'Mở rộng hàng cơ sở',
    description:
      'Luyện thêm hai phím G và H bằng ngón trỏ, kết hợp các phím ở hàng cơ sở.',
    text:
      'fg hj gf jh asdf ghjk ' +
      'fg hj gh fj dk sl ' +
      'asdf jkl; gh gh fg hj ' +
      'sad had flag glad glass',
  },
  {
    id: 'upper-row',
    title: 'Hàng phím trên',
    description:
      'Luyện các phím Q W E R T Y U I O P. Đưa ngón tay lên hàng trên rồi trở lại vị trí cơ sở.',
    text:
      'qwer tyui op qw er ty ui op ' +
      'we were you your type write ' +
      'quite quiet power tower',
  },
  {
    id: 'lower-row',
    title: 'Hàng phím dưới',
    description:
      'Luyện Z X C V B N M và các dấu câu ở hàng dưới bàn phím.',
    text:
      'zxcv bnm,./ zx cv bn m, ./ ' +
      'zxcv bnm,./ mix box van can ' +
      'come move name, nice.',
  },
  {
    id: 'english-sentences',
    title: 'Luyện từ và câu',
    description:
      'Kết hợp các hàng phím để luyện các từ và câu tiếng Anh.',
    text:
      'the quick brown fox jumps over the lazy dog. ' +
      'practice makes progress. ' +
      'type slowly and focus on accuracy.',
  },
  {
    id: 'vietnamese-sentences',
    title: 'Luyện tiếng Việt có dấu',
    description:
      'Luyện nhập văn bản tiếng Việt bằng bộ gõ Telex hoặc VNI trên máy tính.',
    text:
      'tôi luyện gõ mười ngón mỗi ngày. ' +
      'gõ đúng trước, gõ nhanh sau. ' +
      'bạn hãy kiên trì luyện tập!',
  },
];