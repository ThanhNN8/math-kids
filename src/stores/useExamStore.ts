import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamAnswer, ExamResult, ExamSubject } from '@/types/exam';

interface ExamState {
  // Current exam session
  currentExamId: string | null;
  currentSubject: ExamSubject | null;
  currentQuestionIndex: number;
  answers: ExamAnswer[];
  isInProgress: boolean;
  startedAt: string | null;

  // History
  completedExams: ExamResult[];

  // Actions
  startExam: (examId: string, subject: ExamSubject) => void;
  answerQuestion: (answer: ExamAnswer) => void;
  nextQuestion: () => void;
  completeExam: (totalPoints: number, totalQuestions: number) => ExamResult;
  reset: () => void;

  // Getters
  getExamResults: (examId: string) => ExamResult[];
  getBestScore: (examId: string) => number | null;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      currentExamId: null,
      currentSubject: null,
      currentQuestionIndex: 0,
      answers: [],
      isInProgress: false,
      startedAt: null,
      completedExams: [],

      startExam: (examId, subject) => {
        set({
          currentExamId: examId,
          currentSubject: subject,
          currentQuestionIndex: 0,
          answers: [],
          isInProgress: true,
          startedAt: new Date().toISOString(),
        });
      },

      answerQuestion: (answer) => {
        set((state) => ({
          answers: [...state.answers, answer],
        }));
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      completeExam: (totalPoints, totalQuestions) => {
        const state = get();
        const correctCount = state.answers.filter((a) => a.isCorrect).length;
        const score = state.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
        const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

        let starsEarned = 0;
        if (accuracy >= 0.9) starsEarned = 3;
        else if (accuracy >= 0.7) starsEarned = 2;
        else if (accuracy >= 0.5) starsEarned = 1;

        const result: ExamResult = {
          examId: state.currentExamId!,
          subject: state.currentSubject!,
          score,
          totalPoints,
          correctCount,
          totalQuestions,
          accuracy,
          starsEarned,
          completedAt: new Date().toISOString(),
          answers: state.answers,
        };

        set((state) => ({
          completedExams: [...state.completedExams, result],
          isInProgress: false,
          currentExamId: null,
          currentSubject: null,
          currentQuestionIndex: 0,
          answers: [],
          startedAt: null,
        }));

        return result;
      },

      reset: () => {
        set({
          currentExamId: null,
          currentSubject: null,
          currentQuestionIndex: 0,
          answers: [],
          isInProgress: false,
          startedAt: null,
        });
      },

      getExamResults: (examId) => {
        return get().completedExams.filter((r) => r.examId === examId);
      },

      getBestScore: (examId) => {
        const results = get().completedExams.filter((r) => r.examId === examId);
        if (results.length === 0) return null;
        return Math.max(...results.map((r) => r.score));
      },
    }),
    {
      name: 'math-kids-exams',
      partialize: (state) => ({
        completedExams: state.completedExams,
      }),
    }
  )
);
