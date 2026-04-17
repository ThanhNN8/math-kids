import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Exam,
  ExamAnswer,
  ExamResult,
  ExamSubject,
  ExamSlotAnswer,
} from '@/types/exam';

export interface ExamDraftAnswer {
  selectedOptionIndex?: number;
  textAnswer?: string;
  slotValues?: Record<string, string>;
}

interface ExamState {
  // Current session
  currentExamId: string | null;
  currentSubject: ExamSubject | null;
  draftAnswers: Record<string, ExamDraftAnswer>;
  isInProgress: boolean;
  startedAt: string | null;

  // History
  completedExams: ExamResult[];

  // Actions
  startExam: (examId: string, subject: ExamSubject) => void;
  setOptionDraft: (questionId: string, optionIndex: number) => void;
  setTextDraft: (questionId: string, text: string) => void;
  setSlotDraft: (questionId: string, slotId: string, value: string) => void;
  submitExam: (exam: Exam) => ExamResult;
  reset: () => void;

  // Getters
  getExamResults: (examId: string) => ExamResult[];
  getBestScore: (examId: string) => number | null;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesFill(submitted: string, correct: string, acceptable?: string[]): boolean {
  const sub = normalize(submitted);
  if (!sub) return false;
  const pool = [correct, ...(acceptable ?? [])].map(normalize);
  return pool.some((expected) => expected === sub);
}

function evaluateExam(exam: Exam, drafts: Record<string, ExamDraftAnswer>): {
  answers: ExamAnswer[];
  score: number;
  correctCount: number;
} {
  const answers: ExamAnswer[] = [];
  let score = 0;
  let correctCount = 0;

  for (const q of exam.questions) {
    const draft = drafts[q.id] ?? {};

    if (q.type === 'multiple-choice') {
      const selected = draft.selectedOptionIndex;
      const isCorrect = selected !== undefined && selected === q.correctOptionIndex;
      const pointsEarned = isCorrect ? q.points ?? 1 : 0;
      if (isCorrect) correctCount++;
      score += pointsEarned;
      answers.push({
        questionId: q.id,
        selectedOptionIndex: selected,
        isCorrect,
        pointsEarned,
      });
      continue;
    }

    if (q.answerSlots && q.answerSlots.length > 0) {
      const slotAnswers: ExamSlotAnswer[] = q.answerSlots.map((slot) => {
        const submitted = draft.slotValues?.[slot.id] ?? '';
        const isSlotCorrect = matchesFill(submitted, slot.correctAnswer, slot.acceptableAnswers);
        return {
          slotId: slot.id,
          submitted,
          isCorrect: isSlotCorrect,
          pointsEarned: isSlotCorrect ? slot.points : 0,
        };
      });
      const allCorrect = slotAnswers.every((s) => s.isCorrect);
      const earned = slotAnswers.reduce((sum, s) => sum + s.pointsEarned, 0);
      if (allCorrect) correctCount++;
      score += earned;
      answers.push({
        questionId: q.id,
        slotAnswers,
        isCorrect: allCorrect,
        pointsEarned: earned,
      });
      continue;
    }

    // Single fill-blank
    const submitted = draft.textAnswer ?? '';
    const isCorrect = q.correctAnswer
      ? matchesFill(submitted, q.correctAnswer, q.acceptableAnswers)
      : false;
    const pointsEarned = isCorrect ? q.points ?? 1 : 0;
    if (isCorrect) correctCount++;
    score += pointsEarned;
    answers.push({
      questionId: q.id,
      textAnswer: submitted,
      isCorrect,
      pointsEarned,
    });
  }

  return { answers, score, correctCount };
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      currentExamId: null,
      currentSubject: null,
      draftAnswers: {},
      isInProgress: false,
      startedAt: null,
      completedExams: [],

      startExam: (examId, subject) => {
        set({
          currentExamId: examId,
          currentSubject: subject,
          draftAnswers: {},
          isInProgress: true,
          startedAt: new Date().toISOString(),
        });
      },

      setOptionDraft: (questionId, optionIndex) => {
        set((state) => ({
          draftAnswers: {
            ...state.draftAnswers,
            [questionId]: {
              ...state.draftAnswers[questionId],
              selectedOptionIndex: optionIndex,
            },
          },
        }));
      },

      setTextDraft: (questionId, text) => {
        set((state) => ({
          draftAnswers: {
            ...state.draftAnswers,
            [questionId]: {
              ...state.draftAnswers[questionId],
              textAnswer: text,
            },
          },
        }));
      },

      setSlotDraft: (questionId, slotId, value) => {
        set((state) => {
          const prev = state.draftAnswers[questionId] ?? {};
          return {
            draftAnswers: {
              ...state.draftAnswers,
              [questionId]: {
                ...prev,
                slotValues: {
                  ...(prev.slotValues ?? {}),
                  [slotId]: value,
                },
              },
            },
          };
        });
      },

      submitExam: (exam) => {
        const state = get();
        const { answers, score, correctCount } = evaluateExam(exam, state.draftAnswers);
        const accuracy = exam.totalQuestions > 0 ? correctCount / exam.totalQuestions : 0;

        let starsEarned = 0;
        if (accuracy >= 0.9) starsEarned = 3;
        else if (accuracy >= 0.7) starsEarned = 2;
        else if (accuracy >= 0.5) starsEarned = 1;

        const result: ExamResult = {
          examId: exam.id,
          subject: exam.subject,
          score,
          totalPoints: exam.totalPoints,
          correctCount,
          totalQuestions: exam.totalQuestions,
          accuracy,
          starsEarned,
          completedAt: new Date().toISOString(),
          answers,
        };

        set((s) => ({
          completedExams: [...s.completedExams, result],
          isInProgress: false,
          currentExamId: null,
          currentSubject: null,
          draftAnswers: {},
          startedAt: null,
        }));

        return result;
      },

      reset: () => {
        set({
          currentExamId: null,
          currentSubject: null,
          draftAnswers: {},
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
