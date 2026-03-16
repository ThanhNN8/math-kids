'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import { generateMultiplication } from '@/game/math/ProblemGenerator';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { useGameStore } from '@/stores/useGameStore';
import type { MathProblem, ProblemResult } from '@/types';

type Screen = 'start' | 'play' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; desc: string; timeLimit: number; mathLevel: number }> = {
  easy: { label: 'Dễ', desc: '10 giây/câu', timeLimit: 10, mathLevel: 1 },
  medium: { label: 'Trung bình', desc: '7 giây/câu', timeLimit: 7, mathLevel: 2 },
  hard: { label: 'Khó', desc: '3 giây/câu', timeLimit: 3, mathLevel: 3 },
};

interface Enemy {
  id: number;
  value: number;
  x: number;
  y: number;
  isCorrect: boolean;
  destroyed: boolean;
}

interface Missile {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  isCorrect: boolean;
}

export default function ShootingPage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [wave, setWave] = useState(1);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [health, setHealth] = useState(3);
  const [waveProblems, setWaveProblems] = useState(0);
  const [missiles, setMissiles] = useState<Missile[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswering, setIsAnswering] = useState(false);
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const startTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const PROBLEMS_PER_WAVE = 10;
  const TOTAL_WAVES = 3;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((limit: number) => {
    clearTimer();
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // Handle time up — lose a heart and move to next problem
  useEffect(() => {
    if (screen !== 'play' || timeLeft > 0 || isAnswering) return;

    setIsAnswering(true);
    setHealth((h) => {
      const newHealth = Math.max(0, h - 1);
      if (newHealth <= 0) {
        setIsPlaying(false);
        setTimeout(() => setScreen('results'), 500);
      }
      return newHealth;
    });

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

    const newWaveProblems = waveProblems + 1;
    setWaveProblems(newWaveProblems);
    setStreak(0);

    if (health > 1) {
      if (newWaveProblems >= PROBLEMS_PER_WAVE) {
        if (wave >= TOTAL_WAVES) {
          setIsPlaying(false);
          setTimeout(() => setScreen('results'), 500);
        } else {
          setWave((w) => w + 1);
          setWaveProblems(0);
          setTimeout(() => spawnNewProblem(), 800);
        }
      } else {
        setTimeout(() => spawnNewProblem(), 600);
      }
    }
  }, [timeLeft, screen, isAnswering]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const spawnEnemies = useCallback((p: MathProblem) => {
    const newEnemies: Enemy[] = p.options.map((val, i) => ({
      id: Date.now() + i,
      value: val,
      x: 10 + (i % 2) * 45 + Math.random() * 25,
      y: 8 + Math.floor(i / 2) * 30 + Math.random() * 8,
      isCorrect: val === p.correctAnswer,
      destroyed: false,
    }));
    setEnemies(newEnemies);
  }, []);

  const spawnNewProblem = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const p = generateMultiplication(undefined, config.mathLevel);
    setProblem(p);
    spawnEnemies(p);
    startTimeRef.current = Date.now();
    setIsAnswering(false);
    startTimer(config.timeLimit);
  }, [difficulty, spawnEnemies, startTimer]);

  const startGame = useCallback(() => {
    setWave(1);
    setResults([]);
    setScore(0);
    setStreak(0);
    setHealth(3);
    setWaveProblems(0);
    setMissiles([]);
    setIsAnswering(false);
    setIsPlaying(true);
    setScreen('play');
    const config = DIFFICULTY_CONFIG[difficulty];
    const p = generateMultiplication(undefined, config.mathLevel);
    setProblem(p);
    spawnEnemies(p);
    startTimeRef.current = Date.now();
    startTimer(config.timeLimit);
  }, [spawnEnemies, difficulty, startTimer]);

  const shootEnemy = useCallback((enemy: Enemy, e: React.MouseEvent | React.TouchEvent) => {
    if (!problem || enemy.destroyed || isAnswering) return;
    setIsAnswering(true);
    clearTimer();

    // Calculate missile target position relative to battlefield
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    const shipX = fieldRect ? fieldRect.width / 2 : 180;
    const shipY = fieldRect ? fieldRect.height - 20 : 240;
    const targetX = (enemy.x / 100) * (fieldRect?.width || 360);
    const targetY = (enemy.y / 100) * (fieldRect?.height || 256);

    const missile: Missile = {
      id: Date.now(),
      startX: shipX,
      startY: shipY,
      targetX,
      targetY,
      isCorrect: enemy.isCorrect,
    };
    setMissiles((prev) => [...prev, missile]);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = enemy.isCorrect;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score: pts } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);

    // Delay destroy to let missile fly first
    setTimeout(() => {
      setEnemies((prev) => prev.map((en) => en.id === enemy.id ? { ...en, destroyed: true } : en));
      setMissiles((prev) => prev.filter((m) => m.id !== missile.id));

      if (isCorrect) {
        setScore((s) => s + pts);
        setStreak(newStreak);
      } else {
        setStreak(0);
        setHealth((h) => Math.max(0, h - 1));
      }

      const result: ProblemResult = { problem, selectedAnswer: enemy.value, isCorrect, timeMs, score: pts };
      setResults((prev) => [...prev, result]);

      const newWaveProblems = waveProblems + 1;
      setWaveProblems(newWaveProblems);

      if (health <= 1 && !isCorrect) {
        setIsPlaying(false);
        setTimeout(() => setScreen('results'), 500);
        return;
      }

      if (newWaveProblems >= PROBLEMS_PER_WAVE) {
        if (wave >= TOTAL_WAVES) {
          setIsPlaying(false);
          setTimeout(() => setScreen('results'), 500);
        } else {
          setWave((w) => w + 1);
          setWaveProblems(0);
          setTimeout(() => spawnNewProblem(), 800);
        }
      } else {
        setTimeout(() => spawnNewProblem(), 600);
      }
    }, 400);
  }, [problem, streak, health, waveProblems, wave, spawnNewProblem, isAnswering, clearTimer]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const stars = wave >= TOTAL_WAVES && health > 0 ? 3 : wave >= 2 ? 2 : 1;
  const timeLimit = DIFFICULTY_CONFIG[difficulty].timeLimit;
  const timerPercent = (timeLeft / timeLimit) * 100;

  // Results screen
  if (screen === 'results') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <h1 className="text-3xl font-black mb-2">
              {health > 0 ? '🎉 Chiến thắng!' : '💥 Game Over!'}
            </h1>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-3xl font-black text-blue-600">{score}</div>
                <div className="text-sm text-gray-500">Điểm</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">{correctCount}/{results.length}</div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-600">Wave {wave}</div>
                <div className="text-sm text-gray-500">Đạt</div>
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

  // Play screen
  if (screen === 'play' && problem) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex justify-between text-white text-sm font-bold">
          <span>Wave {wave}/{TOTAL_WAVES}</span>
          <span>💰 {score}</span>
          <span>{'❤️'.repeat(health)}{'🖤'.repeat(3 - health)}</span>
        </div>

        {/* Problem + Timer bar */}
        <Card className="text-center py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none relative overflow-hidden">
          {/* Timer bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20">
            <motion.div
              className={`h-full ${timeLeft <= 3 ? 'bg-red-400' : timeLeft <= 5 ? 'bg-yellow-400' : 'bg-green-400'}`}
              initial={false}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs text-white/60">Câu {waveProblems + 1}/{PROBLEMS_PER_WAVE}</span>
            <span className={`text-sm font-black tabular-nums ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white/80'}`}>
              ⏱ {timeLeft}s
            </span>
          </div>
          <div className="text-3xl font-black">
            {problem.num1} × {problem.num2} = ?
          </div>
        </Card>

        {/* Battle field */}
        <div ref={fieldRef} className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 rounded-3xl h-64 overflow-hidden select-none">
          {/* Stars background */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={`star-${i}`} className="absolute w-1 h-1 bg-white rounded-full opacity-60" style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
            }} />
          ))}

          {/* Missiles */}
          <AnimatePresence>
            {missiles.map((m) => (
              <motion.div
                key={m.id}
                initial={{ x: m.startX - 6, y: m.startY - 12, opacity: 1, scale: 1 }}
                animate={{ x: m.targetX - 6, y: m.targetY - 12, opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.35, ease: 'easeIn' }}
                className="absolute z-30 pointer-events-none"
              >
                {/* Missile body */}
                <div className="relative">
                  <div className="text-xl">🚀</div>
                  {/* Trail effect */}
                  <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 rounded-full"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 16, opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: 'linear-gradient(to bottom, #f97316, #fbbf24, transparent)',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Enemies */}
          <AnimatePresence>
            {enemies.filter((e) => !e.destroyed).map((enemy) => (
              <motion.button
                key={enemy.id}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => shootEnemy(enemy, e)}
                disabled={isAnswering}
                className="absolute cursor-pointer z-10"
                style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
              >
                <div className="w-16 h-16 bg-gradient-to-b from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-red-400 hover:border-yellow-400 transition-colors">
                  <span className="text-white text-xl font-black">{enemy.value}</span>
                </div>
                <div className="text-2xl text-center -mt-1">👾</div>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Explosion effects on hit */}
          <AnimatePresence>
            {missiles.map((m) => (
              <motion.div
                key={`explosion-${m.id}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute z-20 pointer-events-none"
                style={{ left: m.targetX - 20, top: m.targetY - 20 }}
              >
                <div className="text-4xl">{m.isCorrect ? '💥' : '❌'}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Player ship */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl z-10">
            🚀
          </div>

          {/* Ship engine glow */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-4 rounded-full blur-sm"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ background: 'radial-gradient(circle, #f97316, transparent)' }}
          />
        </div>

        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center text-yellow-400 font-black text-lg"
          >
            🔥 Streak x{streak}!
          </motion.div>
        )}

        {timeLeft === 0 && screen === 'play' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center text-red-400 font-black text-lg"
          >
            ⏰ Hết giờ!
          </motion.div>
        )}
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Bắn Tàu 🚀</h1>
      <Card className="text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Space Shooter!</h2>
        <p className="text-gray-500 mb-4">Bắn hạ quái vật mang đáp án đúng. 3 waves, mỗi wave 10 đề!</p>

        {/* Difficulty selector */}
        <h3 className="font-bold text-gray-700 mb-3">Chọn cấp độ:</h3>
        <div className="flex gap-3 mb-6">
          {(['easy', 'medium', 'hard'] as const).map((d) => {
            const config = DIFFICULTY_CONFIG[d];
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
                <div className="text-sm">{config.label}</div>
                <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {config.desc}
                </div>
              </motion.button>
            );
          })}
        </div>

        <Button onClick={startGame} variant="secondary" fullWidth size="lg">
          Bắt đầu! 💫
        </Button>
      </Card>
    </div>
  );
}
