'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnswerOptions from '@/components/ui/AnswerOptions';
import ResultFeedback from '@/components/ui/ResultFeedback';
import StarRating from '@/components/ui/StarRating';
import ProgressBar from '@/components/ui/ProgressBar';
import { generateMultiplication } from '@/game/math/ProblemGenerator';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { useGameStore } from '@/stores/useGameStore';
import { useSaveSession } from '@/hooks/useSaveSession';
import type { MathProblem, ProblemResult } from '@/types';

type Screen = 'start' | 'race' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string;
  desc: string;
  timeLimit: number;
  mathLevel: number;
  aiSpeed: number;     // AI advance per tick
  aiInterval: number;  // ms between AI ticks
}> = {
  easy:   { label: 'Dễ',         desc: '7 giây/câu',  timeLimit: 7,  mathLevel: 1, aiSpeed: 3.0, aiInterval: 1800 },
  medium: { label: 'Trung bình', desc: '5 giây/câu',  timeLimit: 5,  mathLevel: 2, aiSpeed: 3.5, aiInterval: 1500 },
  hard:   { label: 'Khó',        desc: '3 giây/câu',  timeLimit: 3,  mathLevel: 3, aiSpeed: 4.5, aiInterval: 1200 },
};

export default function RacingPage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [playerPos, setPlayerPos] = useState(0);
  const [aiPos, setAiPos] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const { saveSession, resetSaveFlag } = useSaveSession();
  const startTimeRef = useRef(0);
  const raceStartTimeRef = useRef(0);
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnsweringRef = useRef(false);

  const TOTAL = 20;
  const FINISH = 100;

  const clearAllTimers = useCallback(() => {
    if (aiIntervalRef.current) { clearInterval(aiIntervalRef.current); aiIntervalRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback((limit: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const newProblem = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const p = generateMultiplication(undefined, config.mathLevel);
    setProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    isAnsweringRef.current = false;
    startTimeRef.current = Date.now();
    startTimer(config.timeLimit);
  }, [difficulty, startTimer]);

  const startRace = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setPlayerPos(0);
    setAiPos(0);
    setResults([]);
    setStreak(0);
    isAnsweringRef.current = false;
    resetSaveFlag();
    raceStartTimeRef.current = Date.now();
    setIsPlaying(true);
    setScreen('race');

    // First problem
    const p = generateMultiplication(undefined, config.mathLevel);
    setProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
    startTimer(config.timeLimit);

    // AI moves — faster based on difficulty
    aiIntervalRef.current = setInterval(() => {
      setAiPos((prev) => Math.min(prev + config.aiSpeed + Math.random() * 1.5, FINISH));
    }, config.aiInterval);
  }, [difficulty, startTimer, setIsPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Handle time up — penalty and next problem
  useEffect(() => {
    if (screen !== 'race' || timeLeft > 0 || isAnsweringRef.current) return;
    isAnsweringRef.current = true;

    // Time up = wrong answer, player slows down
    setPlayerPos((p) => Math.max(p - 2, 0));
    setStreak(0);
    setFeedback(false);

    if (problem) {
      const result: ProblemResult = {
        problem,
        selectedAnswer: -1,
        isCorrect: false,
        timeMs: DIFFICULTY_CONFIG[difficulty].timeLimit * 1000,
        score: 0,
      };
      setResults((prev) => [...prev, result]);
    }

    setTimeout(() => newProblem(), 800);
  }, [timeLeft, screen]);

  // Check race end
  useEffect(() => {
    if (screen === 'race' && (playerPos >= FINISH || aiPos >= FINISH || results.length >= TOTAL)) {
      clearAllTimers();
      setIsPlaying(false);
      setTimeout(() => setScreen('results'), 500);
    }
  }, [playerPos, aiPos, results.length, screen, clearAllTimers, setIsPlaying]);

  const handleAnswer = useCallback((answer: number) => {
    if (!problem || selectedAnswer !== null || isAnsweringRef.current) return;
    isAnsweringRef.current = true;
    setSelectedAnswer(answer);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = answer === problem.correctAnswer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);
    setStreak(newStreak);
    setFeedback(isCorrect);

    if (isCorrect) {
      // Faster answer = bigger boost (need <3s avg to beat AI)
      const boost = timeMs < 2000 ? 10 : timeMs < 3000 ? 7 : timeMs < 5000 ? 4 : 2;
      setPlayerPos((p) => Math.min(p + boost, FINISH));
    } else {
      setPlayerPos((p) => Math.max(p - 2, 0));
    }

    const result: ProblemResult = { problem, selectedAnswer: answer, isCorrect, timeMs, score };
    setResults((prev) => [...prev, result]);

    setTimeout(() => newProblem(), 800);
  }, [problem, selectedAnswer, streak, newProblem]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const playerWon = playerPos >= FINISH || (results.length >= TOTAL && playerPos > aiPos);
  const stars = playerWon ? 3 : playerPos > aiPos * 0.8 ? 2 : 1;
  const config = DIFFICULTY_CONFIG[difficulty];
  const timerPercent = (timeLeft / config.timeLimit) * 100;

  // Save session when entering results
  if (screen === 'results' && results.length > 0) {
    saveSession({ type: 'racing', results, startedAt: raceStartTimeRef.current, starsOverride: stars });
  }

  // Results screen
  if (screen === 'results') {
    const avgTime = results.length > 0
      ? (results.reduce((s, r) => s + r.timeMs, 0) / results.length / 1000).toFixed(1)
      : '0';

    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <h1 className="text-4xl font-black mb-2">
              {playerWon ? '🏆 Nhất! 🏆' : '😅 Cố lên!'}
            </h1>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-3xl font-black text-green-600">{correctCount}/{results.length}</div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600">
                  {results.reduce((s, r) => s + r.score, 0)}
                </div>
                <div className="text-sm text-gray-500">Điểm</div>
              </div>
              <div>
                <div className="text-3xl font-black text-orange-600">{avgTime}s</div>
                <div className="text-sm text-gray-500">TB/câu</div>
              </div>
            </div>
            {!playerWon && (
              <p className="text-sm text-gray-500 mb-4 bg-yellow-50 rounded-xl p-3">
                💡 Mẹo: Trả lời dưới 3 giây mỗi câu để thắng AI nhé!
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => { setIsPlaying(false); setScreen('start'); }} variant="ghost" fullWidth>Menu</Button>
              <Button onClick={startRace} variant="primary" fullWidth>Chơi lại 🔄</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Race screen
  if (screen === 'race' && problem) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex justify-between text-white text-sm font-bold">
          <span>Câu {results.length + 1}/{TOTAL}</span>
          <span className={`tabular-nums ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : timeLeft <= 4 ? 'text-yellow-400' : 'text-white'}`}>
            ⏱ {timeLeft}s
          </span>
          <span>🔥 {streak}</span>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timeLeft <= 2 ? 'bg-red-400' : timeLeft <= 4 ? 'bg-yellow-400' : 'bg-green-400'}`}
            initial={false}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Race track */}
        <Card padding="sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm w-8 font-bold text-blue-600">Bạn</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  animate={{ width: `${playerPos}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
                <motion.span
                  className="absolute top-0.5 text-xl"
                  animate={{ left: `${Math.min(playerPos, 90)}%` }}
                >
                  🏎️
                </motion.span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm w-8 text-red-400 font-bold">AI</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-300 to-red-500 rounded-full"
                  animate={{ width: `${aiPos}%` }}
                />
                <motion.span
                  className="absolute top-0.5 text-xl"
                  animate={{ left: `${Math.min(aiPos, 90)}%` }}
                >
                  🚗
                </motion.span>
              </div>
            </div>
          </div>
        </Card>

        {/* Problem */}
        <Card className="text-center py-4">
          <div className="text-4xl font-black text-gray-800">
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

        <ResultFeedback isCorrect={feedback} />

        {timeLeft === 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-red-400 font-black">
            ⏰ Hết giờ! Xe chậm lại...
          </motion.div>
        )}
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Đua Xe 🏎️</h1>
      <Card className="text-center">
        <div className="text-6xl mb-4">🏎️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng đua!</h2>
        <p className="text-gray-500 text-sm mb-4">
          Trả lời đúng và nhanh để tăng tốc. Dưới 3 giây/câu mới thắng được AI!
        </p>

        {/* Difficulty selector */}
        <h3 className="font-bold text-gray-700 mb-3">Chọn cấp độ:</h3>
        <div className="flex gap-3 mb-6">
          {(['easy', 'medium', 'hard'] as const).map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            const isSelected = difficulty === d;
            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 px-2 rounded-2xl font-bold transition-all ${
                  isSelected
                    ? d === 'easy' ? 'bg-green-500 text-white shadow-lg'
                    : d === 'medium' ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">{cfg.label}</div>
                <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {cfg.desc}
                </div>
              </motion.button>
            );
          })}
        </div>

        <Button onClick={startRace} variant="primary" fullWidth size="lg">
          Bắt đầu đua! 🚀
        </Button>
      </Card>
    </div>
  );
}
