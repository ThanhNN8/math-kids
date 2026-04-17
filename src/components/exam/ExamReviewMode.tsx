'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Exam, ExamAnswer } from '@/types/exam';
import ExamHeader from './ExamHeader';
import ExamSection from './ExamSection';
import ExamQuestionView from './ExamQuestionView';

interface Props {
  exam: Exam;
  answers?: ExamAnswer[];
  onBack: () => void;
}

export default function ExamReviewMode({ exam, answers, onBack }: Props) {
  const [showSolutions, setShowSolutions] = useState(true);

  const mcQuestions = useMemo(
    () => exam.questions.filter((q) => q.sectionId === 'multiple-choice' || !q.sectionId),
    [exam.questions]
  );
  const essayQuestions = useMemo(
    () => exam.questions.filter((q) => q.sectionId === 'essay'),
    [exam.questions]
  );

  const mcSection = exam.sections?.find((s) => s.id === 'multiple-choice');
  const essaySection = exam.sections?.find((s) => s.id === 'essay');

  const renderQuestion = (q: Exam['questions'][number], idx: number, prefix: string) => {
    const answer = answers?.find((a) => a.questionId === q.id);
    return (
      <ExamQuestionView
        key={q.id}
        question={q}
        displayNumber={idx + 1}
        titlePrefix={prefix}
        mode={showSolutions ? 'review' : 'take'}
        answer={answer}
      />
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ←
        </motion.button>
        <h2 className="text-lg md:text-xl font-bold text-white flex-1">
          {exam.title} — Đáp án & Lời giải
        </h2>
      </div>

      <ExamHeader exam={exam} />

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowSolutions((v) => !v)}
          className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow"
        >
          {showSolutions ? '👁️‍🗨️ Ẩn đáp án' : '👁️ Hiện đáp án'}
        </button>
      </div>

      {mcSection && mcQuestions.length > 0 && (
        <ExamSection section={mcSection}>
          {mcQuestions.map((q, i) => renderQuestion(q, i, 'Câu'))}
        </ExamSection>
      )}

      {essaySection && essayQuestions.length > 0 && (
        <ExamSection section={essaySection}>
          {essayQuestions.map((q, i) => renderQuestion(q, i, 'Bài'))}
        </ExamSection>
      )}

      {!mcSection && !essaySection && (
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-md space-y-5">
          {exam.questions.map((q, i) => renderQuestion(q, i, 'Câu'))}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-lg"
      >
        ← Quay lại
      </motion.button>
    </div>
  );
}
