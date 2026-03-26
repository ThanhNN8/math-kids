'use client';

import { motion } from 'framer-motion';
import { ExamQuestion } from '@/types/exam';

interface MultipleChoiceQuestionProps {
  question: ExamQuestion;
  onSelect: (index: number) => void;
  selectedIndex?: number;
  disabled?: boolean;
  showResult?: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  onSelect,
  selectedIndex,
  disabled = false,
  showResult = false,
}: MultipleChoiceQuestionProps) {
  const options = question.options || [];

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        let bgClass = 'bg-white border-2 border-blue-200 hover:bg-blue-50';
        let textClass = 'text-gray-800';

        if (showResult && selectedIndex !== undefined) {
          if (index === question.correctOptionIndex) {
            bgClass = 'bg-green-500 border-2 border-green-600';
            textClass = 'text-white';
          } else if (index === selectedIndex && index !== question.correctOptionIndex) {
            bgClass = 'bg-red-500 border-2 border-red-600';
            textClass = 'text-white';
          } else {
            bgClass = 'bg-gray-100 border-2 border-gray-200';
            textClass = 'text-gray-400';
          }
        } else if (selectedIndex === index) {
          bgClass = 'bg-blue-500 border-2 border-blue-600';
          textClass = 'text-white';
        }

        return (
          <motion.button
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileTap={disabled ? undefined : { scale: 0.95 }}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={`w-full p-4 rounded-2xl text-left text-lg font-semibold transition-all ${bgClass} ${textClass} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}
