'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MathProblemDisplay from '@/components/ui/MathProblem';
import AnswerOptions from '@/components/ui/AnswerOptions';
import ResultFeedback from '@/components/ui/ResultFeedback';
import StarRating from '@/components/ui/StarRating';
import { generateMixed } from '@/game/math/ProblemGenerator';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { DifficultyManager } from '@/game/math/DifficultyManager';
import { useGameStore } from '@/stores/useGameStore';
import type { MathProblem, ProblemResult } from '@/types';

type Screen = 'start' | 'play' | 'results';

export default function MentalMathPage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const startTimeRef = useRef(0);
  const difficultyRef = useRef(new DifficultyManager());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const newProblem = useCallback(() => {
    const p = generateMixed(difficultyRef.current.difficulty);
    setProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
  }, []);

  const startGame = useCallback(() => {
    setResults([]);
    setStreak(0);
    setTotalScore(0);
    setTimeLeft(timeLimit);
    difficultyRef.current.reset();
    setIsPlaying(true);
    setScreen('play');
    newProblem();
  }, [timeLimit, newProblem]);

  useEffect(() => {
    if (screen !== 'play') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setScreen('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  const handleAnswer = useCallback((answer: number) => {
    if (!problem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = answer === problem.correctAnswer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);

    setStreak(newStreak);
    if (isCorrect) setTotalScore((s) => s + score);
    setLastScore(score);
    setFeedback(isCorrect);
    difficultyRef.current.recordResult(isCorrect, timeMs);

    const result: ProblemResult = { problem, selectedAnswer: answer, isCorrect, timeMs, score };
    setResults((prev) => [...prev, result]);

    // Auto advance after 800ms
    setTimeout(() => newProblem(), 800);
  }, [problem, selectedAnswer, streak, newProblem]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const stars = ScoreCalculator.calculateStars(results.length, correctCount);

  if (screen === 'results') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <h1 className="text-3xl font-black text-gray-800 mb-2">Hết giờ! ⏰</h1>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-3xl font-black text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-500">Tổng điểm</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">{correctCount}/{results.length}</div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-600">{results.length}</div>
                <div className="text-sm text-gray-500">Bài giải</div>
              </div>
              <div>
                <div className="text-3xl font-black text-orange-600">
                  {results.length > 0
                    ? (results.reduce((s, r) => s + r.timeMs, 0) / results.length / 1000).toFixed(1)
                    : 0}s
                </div>
                <div className="text-sm text-gray-500">TB/câu</div>
              </div>
            </div>
            <Button onClick={startGame} variant="primary" fullWidth size="lg">
              Chơi lại 🔄
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (screen === 'play' && problem) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setIsPlaying(false); setScreen('results'); }} variant="ghost" size="sm">
            ← Dừng
          </Button>
          <div className={`text-3xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            ⏱ {timeLeft}s
          </div>
          <div className="text-white font-bold">🔥 {streak}</div>
        </div>

        <div className="flex justify-between text-white/80 text-sm font-bold">
          <span>Điểm: {totalScore}</span>
          <span>Câu: {results.length + 1}</span>
        </div>

        <Card className="text-center py-8">
          <MathProblemDisplay problem={problem} size="xl" />
        </Card>

        <AnswerOptions
          options={problem.options}
          correctAnswer={problem.correctAnswer}
          onSelect={handleAnswer}
          disabled={selectedAnswer !== null}
          selectedAnswer={selectedAnswer}
        />

        <ResultFeedback isCorrect={feedback} score={lastScore} />
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Tính Nhẩm Nhanh 🧠</h1>

      <Card className="text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Chọn thời gian:</h2>
        <div className="flex gap-3 justify-center mb-4">
          {[30, 60, 120].map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTimeLimit(t)}
              className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all ${
                timeLimit === t
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}s
            </motion.button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Trả lời nhanh nhất có thể! Cộng, trừ, nhân trong phạm vi bảng cửu chương.
        </p>
        <Button onClick={startGame} variant="success" fullWidth size="lg">
          Bắt đầu! 🚀
        </Button>
      </Card>
    </div>
  );
}
