'use client';

import { motion } from 'framer-motion';
import type { MathProblem as MathProblemType } from '@/types';

interface MathProblemProps {
  problem: MathProblemType;
  showAnswer?: boolean;
  size?: 'md' | 'lg' | 'xl';
}

const operationSymbols = {
  multiply: '×',
  add: '+',
  subtract: '−',
};

export default function MathProblemDisplay({ problem, showAnswer = false, size = 'lg' }: MathProblemProps) {
  const fontSize = size === 'xl' ? 'text-6xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center font-bold ${fontSize} text-gray-800 select-none`}
    >
      <span>{problem.num1}</span>
      <span className="mx-4 text-blue-500">{operationSymbols[problem.operation]}</span>
      <span>{problem.num2}</span>
      <span className="mx-4">=</span>
      <span className={showAnswer ? 'text-green-500' : 'text-gray-300'}>
        {showAnswer ? problem.correctAnswer : '?'}
      </span>
    </motion.div>
  );
}
