export type ExamSubject = 'toan' | 'tieng-viet' | 'tieng-anh';
export type QuestionType = 'multiple-choice' | 'fill-blank' | 'reading';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  passage?: string;
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  acceptableAnswers?: string[];
  explanation: string;
  points?: number;
}

export interface Exam {
  id: string;
  subject: ExamSubject;
  title: string;
  description: string;
  totalQuestions: number;
  totalPoints: number;
  timeMinutes: number;
  questions: ExamQuestion[];
}

export interface ExamSubjectInfo {
  slug: ExamSubject;
  name: string;
  icon: string;
  color: string;
  examCount: number;
}

export interface ExamResult {
  examId: string;
  subject: ExamSubject;
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  starsEarned: number;
  completedAt: string;
  answers: ExamAnswer[];
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
}
