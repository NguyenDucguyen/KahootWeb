import { BobFile, BobQuestion } from '../types/bob';

export interface ImportedQuestion {
  id: string;
  type: 'multiple_choice' | 'text_input';
  question_text: string;
  question_image?: string;
  options?: string[];
  correct_answer: string;
  timer: number;
  points: number;
}

export interface ImportedQuiz {
  title: string;
  backgroundImage?: string;
  audioFile?: string;
  questions: ImportedQuestion[];
}

export function parseBobFile(content: string): ImportedQuiz {
  const bobData: BobFile = JSON.parse(content);

  return {
    title: bobData.quiz.title,
    backgroundImage: bobData.quiz.backgroundImage,
    audioFile: bobData.quiz.audioFile,
    questions: bobData.quiz.questions.map(q => ({
      id: crypto.randomUUID(),
      type: q.type === 'multiple-choice' ? 'multiple_choice' : 'text_input',
      question_text: q.question,
      question_image: q.questionImage,
      options: q.type === 'multiple-choice' ? q.options : undefined,
      correct_answer: q.correctAnswer,
      timer: q.timer || 30,
      points: 100,
    }))
  };
}

export function parseJsonFile(content: string): ImportedQuiz {
  const jsonData = JSON.parse(content);

  if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions)) {
    throw new Error('File JSON không đúng định dạng. Cần có "title" và "questions"');
  }

  return {
    title: jsonData.title,
    backgroundImage: jsonData.backgroundImage,
    audioFile: jsonData.audioFile,
    questions: jsonData.questions.map((q: any) => ({
      id: crypto.randomUUID(),
      type: q.type || 'multiple_choice',
      question_text: q.question_text || q.question || '',
      question_image: q.question_image || q.questionImage,
      options: q.options,
      correct_answer: q.correct_answer || q.correctAnswer || '',
      timer: q.timer || 30,
      points: q.points || 100,
    }))
  };
}

export function parseCsvFile(content: string): ImportedQuiz {
  const lines = content.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('File CSV phải có ít nhất header và một câu hỏi');
  }

  const headers = lines[0].split(',').map(h => h.trim());

  const requiredHeaders = ['question', 'type', 'correct_answer'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`File CSV thiếu các cột: ${missingHeaders.join(', ')}`);
  }

  const questions: ImportedQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const question: ImportedQuestion = {
      id: crypto.randomUUID(),
      type: row.type === 'text_input' ? 'text_input' : 'multiple_choice',
      question_text: row.question,
      question_image: row.question_image || undefined,
      correct_answer: row.correct_answer,
      timer: parseInt(row.timer) || 30,
      points: parseInt(row.points) || 100,
    };

    if (question.type === 'multiple_choice') {
      const options = [
        row.option1,
        row.option2,
        row.option3,
        row.option4
      ].filter(Boolean);

      if (options.length > 0) {
        question.options = options;
      }
    }

    questions.push(question);
  }

  return {
    title: 'Quiz từ CSV',
    questions
  };
}

export function exportToBobFile(
  title: string,
  questions: ImportedQuestion[],
  backgroundImage?: string,
  audioFile?: string
): string {
  const bobQuestions: BobQuestion[] = questions.map(q => ({
    id: q.id,
    type: q.type === 'multiple_choice' ? 'multiple-choice' : 'fill-in-blank',
    question: q.question_text,
    questionImage: q.question_image,
    options: q.options,
    correctAnswer: q.correct_answer,
    timer: q.timer,
  }));

  const bobFile: BobFile = {
    version: '1.0',
    quiz: {
      title,
      backgroundImage,
      audioFile,
      defaultTimer: 30,
      studentCount: 50,
      gridColumns: 6,
      questions: bobQuestions,
    }
  };

  return JSON.stringify(bobFile, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
