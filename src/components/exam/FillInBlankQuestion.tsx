'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExamQuestion } from '@/types/exam';

interface FillInBlankQuestionProps {
  question: ExamQuestion;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  submittedAnswer?: string;
}

export default function FillInBlankQuestion({
  question,
  onSubmit,
  disabled = false,
  showResult = false,
  submittedAnswer,
}: FillInBlankQuestionProps) {
  const [value, setValue] = useState('');

  const isCorrect =
    showResult && submittedAnswer !== undefined
      ? (question.acceptableAnswers || [question.correctAnswer || '']).some(
          (a) => a.toLowerCase().trim() === submittedAnswer.toLowerCase().trim()
        )
      : false;

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={disabled ? submittedAnswer || '' : value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={disabled}
          placeholder="Nhập đáp án..."
          className={`flex-1 p-4 text-lg rounded-2xl border-2 outline-none transition-all ${
            showResult
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-blue-200 focus:border-blue-500 bg-white'
          } ${disabled ? 'cursor-default' : ''}`}
        />
        {!disabled && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-6 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OK
          </motion.button>
        )}
      </div>
      {showResult && (
        <div className={`p-3 rounded-xl text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isCorrect ? '✓ Đúng!' : `✗ Sai. Đáp án đúng: ${question.correctAnswer}`}
        </div>
      )}
    </motion.div>
  );
}
