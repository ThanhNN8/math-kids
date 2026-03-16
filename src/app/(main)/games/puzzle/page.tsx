'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnswerOptions from '@/components/ui/AnswerOptions';
import StarRating from '@/components/ui/StarRating';
import { generateMultiplication } from '@/game/math/ProblemGenerator';
import type { MathProblem, ProblemResult } from '@/types';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { useGameStore } from '@/stores/useGameStore';

type Screen = 'start' | 'play' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

const gridSizes: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };
const puzzleImages = ['🐱', '🐶', '🐰', '🦁', '🐬', '🦄', '🐲', '🦋'];

export default function PuzzlePage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [pieces, setPieces] = useState<boolean[]>([]);
  const [currentPieceIdx, setCurrentPieceIdx] = useState(0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [puzzleEmoji, setPuzzleEmoji] = useState('🐱');
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const startTimeRef = { current: 0 };

  const gridSize = gridSizes[difficulty];
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    if (screen !== 'play') return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [screen, startTime]);

  const startGame = useCallback(() => {
    setPieces(new Array(totalPieces).fill(false));
    setCurrentPieceIdx(0);
    setResults([]);
    setStreak(0);
    setStartTime(Date.now());
    setElapsed(0);
    setPuzzleEmoji(puzzleImages[Math.floor(Math.random() * puzzleImages.length)]);
    const p = generateMultiplication(undefined, difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
    setProblem(p);
    setSelectedAnswer(null);
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    setScreen('play');
  }, [totalPieces, difficulty]);

  const handleAnswer = useCallback((answer: number) => {
    if (!problem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = answer === problem.correctAnswer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);
    setStreak(newStreak);

    const result: ProblemResult = { problem, selectedAnswer: answer, isCorrect, timeMs, score };
    setResults((prev) => [...prev, result]);

    if (isCorrect) {
      setPieces((prev) => {
        const next = [...prev];
        next[currentPieceIdx] = true;
        return next;
      });
      const nextIdx = currentPieceIdx + 1;
      if (nextIdx >= totalPieces) {
        setIsPlaying(false);
        setTimeout(() => setScreen('results'), 800);
        return;
      }
      setCurrentPieceIdx(nextIdx);
    }

    setTimeout(() => {
      const p = generateMultiplication(undefined, difficulty === 'easy' ? 1 : 2);
      setProblem(p);
      setSelectedAnswer(null);
      startTimeRef.current = Date.now();
    }, 800);
  }, [problem, selectedAnswer, streak, currentPieceIdx, totalPieces, difficulty]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const stars = elapsed < 60 ? 3 : elapsed < 120 ? 2 : 1;

  if (screen === 'results') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <h1 className="text-3xl font-black mb-2">Hoàn thành! 🧩</h1>
            <div className="text-6xl mb-2">{puzzleEmoji}</div>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-black text-blue-600">{elapsed}s</div>
                <div className="text-sm text-gray-500">Thời gian</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-600">{correctCount}/{results.length}</div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
              <div>
                <div className="text-2xl font-black text-purple-600">{results.reduce((s, r) => s + r.score, 0)}</div>
                <div className="text-sm text-gray-500">Điểm</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setIsPlaying(false); setScreen('start'); }} variant="ghost" fullWidth>Menu</Button>
              <Button onClick={startGame} variant="primary" fullWidth>Chơi lại 🔄</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (screen === 'play' && problem) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex justify-between text-white text-sm font-bold">
          <span>🧩 {pieces.filter(Boolean).length}/{totalPieces}</span>
          <span>⏱ {elapsed}s</span>
          <span>🔥 {streak}</span>
        </div>

        {/* Puzzle grid */}
        <Card padding="sm">
          <div className={`grid gap-1 ${gridSize === 2 ? 'grid-cols-2' : gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {pieces.map((solved, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={solved ? { rotateY: 0 } : { rotateY: 180 }}
                className={`aspect-square rounded-xl flex items-center justify-center text-4xl ${
                  solved
                    ? 'bg-gradient-to-br from-green-300 to-green-500'
                    : i === currentPieceIdx
                    ? 'bg-yellow-200 border-2 border-yellow-400 animate-pulse'
                    : 'bg-gray-200'
                }`}
              >
                {solved ? puzzleEmoji : i === currentPieceIdx ? '❓' : ''}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Problem */}
        <Card className="text-center py-3">
          <div className="text-3xl font-black text-gray-800">
            {problem.num1} × {problem.num2} = ?
          </div>
        </Card>

        <AnswerOptions
          options={problem.options}
          correctAnswer={problem.correctAnswer}
          onSelect={handleAnswer}
          disabled={selectedAnswer !== null}
          selectedAnswer={selectedAnswer}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Xếp Hình 🧩</h1>
      <Card className="text-center">
        <div className="text-6xl mb-4">🧩</div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn độ khó:</h2>
        <div className="flex gap-3 justify-center mb-4">
          {([['easy', 'Dễ (2×2)'], ['medium', 'Vừa (3×3)'], ['hard', 'Khó (4×4)']] as const).map(([d, label]) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDifficulty(d)}
              className={`px-5 py-3 rounded-2xl font-bold transition-all ${
                difficulty === d ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mb-4">Giải toán để mở từng mảnh ghép. Nhanh hơn = nhiều sao hơn!</p>
        <Button onClick={startGame} variant="primary" fullWidth size="lg">
          Bắt đầu! 🧩
        </Button>
      </Card>
    </div>
  );
}
