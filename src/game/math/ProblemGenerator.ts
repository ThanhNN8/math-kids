import type { MathProblem } from '@/types';

let problemIdCounter = 0;

function generateId(): string {
  return `p_${Date.now()}_${++problemIdCounter}`;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDistractors(correct: number, operation: MathProblem['operation']): number[] {
  const distractors = new Set<number>();

  // Smart distractors: nearby values
  const nearby = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 10, correct - 10];
  for (const n of nearby) {
    if (n > 0 && n !== correct) distractors.add(n);
  }

  // Swap digit distractor for multiplication
  if (operation === 'multiply' && correct >= 10) {
    const swapped = parseInt(String(correct).split('').reverse().join(''));
    if (swapped !== correct && swapped > 0) distractors.add(swapped);
  }

  // Common mistake: off by one factor
  if (operation === 'multiply') {
    distractors.add(correct + Math.floor(Math.random() * 5) + 3);
    distractors.add(Math.max(1, correct - Math.floor(Math.random() * 5) - 3));
  }

  // Fill remaining with random nearby
  while (distractors.size < 10) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const val = correct + offset;
    if (val > 0 && val !== correct) distractors.add(val);
  }

  return Array.from(distractors);
}

export function generateMultiplication(table?: number, difficulty: number = 1): MathProblem {
  const num1 = table || Math.floor(Math.random() * 8) + 2; // 2-9
  let num2: number;

  if (difficulty <= 1) {
    num2 = Math.floor(Math.random() * 5) + 1; // 1-5
  } else if (difficulty <= 2) {
    num2 = Math.floor(Math.random() * 8) + 2; // 2-9
  } else {
    num2 = Math.floor(Math.random() * 9) + 2; // 2-10
  }

  const correctAnswer = num1 * num2;
  const allDistractors = generateDistractors(correctAnswer, 'multiply');
  const picked = shuffle(allDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);

  return {
    id: generateId(),
    num1,
    num2,
    operation: 'multiply',
    correctAnswer,
    options,
    difficulty,
  };
}

export function generateAddition(maxSum: number = 50, difficulty: number = 1): MathProblem {
  let num1: number, num2: number;

  if (difficulty <= 1) {
    num1 = Math.floor(Math.random() * 20) + 1;
    num2 = Math.floor(Math.random() * 20) + 1;
  } else {
    num1 = Math.floor(Math.random() * Math.min(maxSum, 50)) + 10;
    num2 = Math.floor(Math.random() * Math.min(maxSum, 50)) + 10;
  }

  const correctAnswer = num1 + num2;
  const allDistractors = generateDistractors(correctAnswer, 'add');
  const picked = shuffle(allDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);

  return {
    id: generateId(),
    num1,
    num2,
    operation: 'add',
    correctAnswer,
    options,
    difficulty,
  };
}

export function generateSubtraction(maxNum: number = 50, difficulty: number = 1): MathProblem {
  let num1: number, num2: number;

  if (difficulty <= 1) {
    num1 = Math.floor(Math.random() * 20) + 10;
    num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
  } else {
    num1 = Math.floor(Math.random() * Math.min(maxNum, 80)) + 20;
    num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
  }

  const correctAnswer = num1 - num2;
  const allDistractors = generateDistractors(correctAnswer, 'subtract');
  const picked = shuffle(allDistractors).slice(0, 3);
  const options = shuffle([correctAnswer, ...picked]);

  return {
    id: generateId(),
    num1,
    num2,
    operation: 'subtract',
    correctAnswer,
    options,
    difficulty,
  };
}

export function generateMixed(difficulty: number = 1): MathProblem {
  const rand = Math.random();
  if (rand < 0.4) return generateMultiplication(undefined, difficulty);
  if (rand < 0.7) return generateAddition(50, difficulty);
  return generateSubtraction(50, difficulty);
}
