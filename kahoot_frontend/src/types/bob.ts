export interface BobQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank';
  question: string;
  questionImage?: string;
  options?: string[];
  correctAnswer: string;
  timer: number;
}

export interface BobQuiz {
  title: string;
  backgroundImage?: string;
  audioFile?: string;
  defaultTimer: number;
  studentCount: number;
  gridColumns: number;
  questions: BobQuestion[];
}

export interface BobFile {
  version: string;
  quiz: BobQuiz;
}
