'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MathProblemDisplay from '@/components/ui/MathProblem';
import AnswerOptions from '@/components/ui/AnswerOptions';
import ResultFeedback from '@/components/ui/ResultFeedback';
import StarRating from '@/components/ui/StarRating';
import ProgressBar from '@/components/ui/ProgressBar';
import { generateMultiplication } from '@/game/math/ProblemGenerator';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { DifficultyManager } from '@/game/math/DifficultyManager';
import { useGameStore } from '@/stores/useGameStore';
import { useUserStore } from '@/stores/useUserStore';
import type { MathProblem, ProblemResult } from '@/types';

type Mode = 'table' | 'quiz' | 'results';

export default function MultiplicationPage() {
  const [mode, setMode] = useState<Mode>('table');
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const startTimeRef = useRef<number>(0);
  const difficultyRef = useRef(new DifficultyManager());

  const gameStore = useGameStore();
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const user = useUserStore((s) => s.user);
  const updateStars = useUserStore((s) => s.updateStars);

  const TOTAL_PROBLEMS = 20;

  const startQuiz = useCallback((table: number) => {
    setSelectedTable(table);
    setResults([]);
    setProblemCount(0);
    difficultyRef.current.reset();
    gameStore.startSession('practice');
    gameStore.resetStreak();
    const problem = generateMultiplication(table, 1);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setFeedbackResult(null);
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    setMode('quiz');
  }, []);

  const handleAnswer = useCallback((answer: number) => {
    if (!currentProblem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = answer === currentProblem.correctAnswer;
    const streak = isCorrect ? gameStore.streak + 1 : 0;
    const { score, xp } = ScoreCalculator.calculate(isCorrect, timeMs, streak);

    if (isCorrect) {
      gameStore.incrementStreak();
      gameStore.addScore(score);
    } else {
      gameStore.resetStreak();
    }

    setLastScore(score);
    setFeedbackResult(isCorrect);
    difficultyRef.current.recordResult(isCorrect, timeMs);

    const result: ProblemResult = {
      problem: currentProblem,
      selectedAnswer: answer,
      isCorrect,
      timeMs,
      score,
    };
    setResults((prev) => [...prev, result]);
    gameStore.addResult(result);
    setProblemCount((c) => c + 1);
  }, [currentProblem, selectedAnswer, gameStore]);

  const nextProblem = useCallback(() => {
    if (problemCount + 1 >= TOTAL_PROBLEMS) {
      setIsPlaying(false);
      setMode('results');
      return;
    }
    const problem = generateMultiplication(selectedTable, difficultyRef.current.difficulty);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setFeedbackResult(null);
    startTimeRef.current = Date.now();
  }, [problemCount, selectedTable]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const stars = ScoreCalculator.calculateStars(results.length, correctCount);

  if (mode === 'results') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center bg-gradient-to-b from-yellow-50 to-white">
            <h1 className="text-3xl font-black text-gray-800 mb-2">Hoàn thành! 🎉</h1>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-3xl font-black text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-500">Điểm</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">
                  {results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Chính xác</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-600">{correctCount}/{results.length}</div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setIsPlaying(false); setMode('table'); }} variant="ghost" fullWidth>
                Chọn bảng khác
              </Button>
              <Button onClick={() => startQuiz(selectedTable)} variant="primary" fullWidth>
                Chơi lại 🔄
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (mode === 'quiz' && currentProblem) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => { setIsPlaying(false); setMode('table'); }} variant="ghost" size="sm">← Thoát</Button>
          <div className="text-white font-bold">Bảng {selectedTable}</div>
          <div className="text-white/80 text-sm font-bold">{problemCount + 1}/{TOTAL_PROBLEMS}</div>
        </div>
        <ProgressBar value={problemCount} max={TOTAL_PROBLEMS} color="green" height="sm" />

        <Card className="text-center py-8">
          <MathProblemDisplay problem={currentProblem} size="xl" />
        </Card>

        <AnswerOptions
          options={currentProblem.options}
          correctAnswer={currentProblem.correctAnswer}
          onSelect={handleAnswer}
          disabled={selectedAnswer !== null}
          selectedAnswer={selectedAnswer}
        />

        {selectedAnswer !== null && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <Button onClick={nextProblem} variant="primary" size="lg" fullWidth>
              {problemCount + 1 >= TOTAL_PROBLEMS ? 'Xem kết quả →' : 'Câu tiếp →'}
            </Button>
          </motion.div>
        )}

        <ResultFeedback isCorrect={feedbackResult} score={lastScore} onComplete={() => {}} />
      </div>
    );
  }

  // Table selection mode
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Bảng Cửu Chương ✖️</h1>

      {/* Multiplication table grid */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Chọn bảng để luyện:</h2>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((table) => (
            <motion.button
              key={table}
              whileTap={{ scale: 0.9 }}
              onClick={() => startQuiz(table)}
              className="h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl font-black shadow-lg hover:shadow-xl transition-shadow"
            >
              {table}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Interactive 10x10 table */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Bảng Nhân 10×10</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-1 text-gray-400">×</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="p-1 font-bold text-blue-600">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, row) => (
                <tr key={row}>
                  <td className="p-1 font-bold text-blue-600">{row + 1}</td>
                  {Array.from({ length: 10 }, (_, col) => (
                    <td
                      key={col}
                      className="p-1 rounded-lg text-gray-700 hover:bg-blue-100 cursor-pointer transition-colors font-medium"
                    >
                      {(row + 1) * (col + 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
