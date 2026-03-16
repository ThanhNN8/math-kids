'use client';

import { motion } from 'framer-motion';

interface AnswerOptionsProps {
  options: number[];
  correctAnswer: number;
  onSelect: (answer: number) => void;
  disabled?: boolean;
  selectedAnswer?: number | null;
}

export default function AnswerOptions({
  options,
  correctAnswer,
  onSelect,
  disabled = false,
  selectedAnswer = null,
}: AnswerOptionsProps) {
  const getButtonStyle = (option: number) => {
    if (selectedAnswer === null) {
      return 'bg-white border-3 border-blue-300 text-gray-800 hover:bg-blue-50 hover:border-blue-500';
    }
    if (option === correctAnswer) {
      return 'bg-green-500 border-3 border-green-600 text-white';
    }
    if (option === selectedAnswer && option !== correctAnswer) {
      return 'bg-red-500 border-3 border-red-600 text-white';
    }
    return 'bg-gray-100 border-3 border-gray-200 text-gray-400';
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
      {options.map((option, index) => (
        <motion.button
          key={`${option}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
          className={`
            h-20 rounded-2xl text-3xl font-bold transition-all select-none
            ${getButtonStyle(option)}
            ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-95'}
          `}
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}
