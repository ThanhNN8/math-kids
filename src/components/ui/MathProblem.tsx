'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpeech } from '@/hooks/useSpeech';
import type { MathProblem as MathProblemType } from '@/types';

interface MathProblemProps {
  problem: MathProblemType;
  showAnswer?: boolean;
  size?: 'md' | 'lg' | 'xl';
  autoSpeak?: boolean;
  showSpeaker?: boolean;
}

const operationSymbols = {
  multiply: '×',
  add: '+',
  subtract: '−',
};

export default function MathProblemDisplay({
  problem,
  showAnswer = false,
  size = 'lg',
  autoSpeak = false,
  showSpeaker = true,
}: MathProblemProps) {
  const fontSize = size === 'xl' ? 'text-6xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  const { speakProblem, speakResult, stop } = useSpeech();

  // Auto-speak when problem changes
  useEffect(() => {
    if (autoSpeak && problem) {
      speakProblem(problem.num1, problem.operation, problem.num2);
    }
    return () => stop();
  }, [autoSpeak, problem.num1, problem.num2, problem.operation]);

  const handleSpeak = () => {
    if (showAnswer) {
      speakResult(problem.num1, problem.operation, problem.num2, problem.correctAnswer);
    } else {
      speakProblem(problem.num1, problem.operation, problem.num2);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center font-bold ${fontSize} text-gray-800 select-none relative`}
    >
      <div>
        <span>{problem.num1}</span>
        <span className="mx-4 text-blue-500">{operationSymbols[problem.operation]}</span>
        <span>{problem.num2}</span>
        <span className="mx-4">=</span>
        <span className={showAnswer ? 'text-green-500' : 'text-gray-300'}>
          {showAnswer ? problem.correctAnswer : '?'}
        </span>
      </div>

      {showSpeaker && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSpeak}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          title="Nghe đọc"
        >
          <span className="text-2xl">🔊</span>
        </motion.button>
      )}
    </motion.div>
  );
}
