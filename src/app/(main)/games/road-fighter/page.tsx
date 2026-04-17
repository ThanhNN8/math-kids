'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnswerOptions from '@/components/ui/AnswerOptions';
import ResultFeedback from '@/components/ui/ResultFeedback';
import StarRating from '@/components/ui/StarRating';
import { generateMultiplication } from '@/game/math/ProblemGenerator';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';
import { useGameStore } from '@/stores/useGameStore';
import { useSaveSession } from '@/hooks/useSaveSession';
import type { MathProblem, ProblemResult } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'start' | 'driving' | 'checkpoint' | 'checkpoint-results' | 'game-over' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameObject {
  id: number;
  type: 'obstacle' | 'fuel';
  lane: number;
  y: number;
  emoji: string;
}

interface StageConfig {
  spawnInterval: number;
  objectSpeed: number;
  fuelDrain: number;
  mathDifficulty: number;
  timePerQuestion: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OBSTACLE_EMOJIS = ['🚗', '🚙', '🚕', '🚌'];
const OBSTACLE_COLORS: Record<string, string> = {
  '🚗': '#ef4444', '🚙': '#22c55e', '🚕': '#eab308', '🚌': '#f97316',
};

function CarTopDown({ color, size = 24 }: { color: string; size?: number }) {
  const h = Math.round(size * 1.7);
  return (
    <div style={{ width: size, height: h, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '12%', left: -3, width: 5, height: '22%', background: '#333', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: '12%', right: -3, width: 5, height: '22%', background: '#333', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: '12%', left: -3, width: 5, height: '22%', background: '#333', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: '12%', right: -3, width: 5, height: '22%', background: '#333', borderRadius: 2 }} />
      <div style={{ width: '100%', height: '100%', background: color, borderRadius: '7px 7px 5px 5px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
        <div style={{ position: 'absolute', top: '14%', left: '18%', right: '18%', height: '18%', background: 'rgba(135,206,250,0.5)', borderRadius: 3 }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '18%', right: '18%', height: '12%', background: 'rgba(135,206,250,0.3)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

const STAGE_DISTANCE = 1300; // +30% from original 1000
const CHECKPOINT_QUESTIONS = 10;
const INITIAL_LIVES = 3;
const INVINCIBLE_MS = 1500;
const INITIAL_FUEL = 40;
const FUEL_PICKUP_AMOUNT = 25;
const BONUS_FUEL_AMOUNT = 30;
const FUEL_SPAWN_POINTS = [0.30, 0.65]; // spawn fuel at 30% and 65% of stage distance
const COAST_SPEED_MULT = 0.15;  // 15% speed when not accelerating
const COAST_DRAIN_MULT = 0.25;  // 25% fuel drain when not accelerating

const DIFFICULTY_BASE: Record<Difficulty, { label: string; desc: string; fuelMult: number; speedMult: number }> = {
  easy:   { label: 'Dễ',         desc: 'Xăng nhiều, xe chậm', fuelMult: 0.8, speedMult: 0.8 },
  medium: { label: 'Trung bình', desc: 'Cân bằng',            fuelMult: 1.0, speedMult: 1.0 },
  hard:   { label: 'Khó',        desc: 'Xăng ít, xe nhanh',   fuelMult: 1.3, speedMult: 1.3 },
};

function getStageConfig(stage: number, difficulty: Difficulty): StageConfig {
  const base = DIFFICULTY_BASE[difficulty];
  const configs: StageConfig[] = [
    { spawnInterval: 1200, objectSpeed: 1.5, fuelDrain: 0.08,  mathDifficulty: 1, timePerQuestion: 10 },
    { spawnInterval: 1000, objectSpeed: 2.0, fuelDrain: 0.10,  mathDifficulty: 2, timePerQuestion: 8 },
    { spawnInterval: 800,  objectSpeed: 2.5, fuelDrain: 0.14,  mathDifficulty: 3, timePerQuestion: 6 },
  ];
  const idx = Math.min(stage - 1, 2);
  const cfg = configs[idx];
  const extra = Math.max(0, stage - 3);
  return {
    spawnInterval: Math.max(500, cfg.spawnInterval - extra * 50),
    objectSpeed: (cfg.objectSpeed + extra * 0.3) * base.speedMult,
    fuelDrain: (cfg.fuelDrain + extra * 0.02) * base.fuelMult,
    mathDifficulty: Math.min(cfg.mathDifficulty, 3),
    timePerQuestion: cfg.timePerQuestion,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RoadFighterPage() {
  // ── Screen state ──
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // ── Driving state ──
  const [playerLane, setPlayerLane] = useState(1);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [fuel, setFuel] = useState(INITIAL_FUEL);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [stage, setStage] = useState(1);
  const [distance, setDistance] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [fuelPickup, setFuelPickup] = useState<{ id: number; lane: number } | null>(null);

  // ── Checkpoint state ──
  const [checkpointProblem, setCheckpointProblem] = useState<MathProblem | null>(null);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [checkpointCorrect, setCheckpointCorrect] = useState(0);
  const [checkpointResults, setCheckpointResults] = useState<ProblemResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [streak, setStreak] = useState(0);

  // ── Overall results ──
  const [allResults, setAllResults] = useState<ProblemResult[]>([]);
  const [maxStage, setMaxStage] = useState(1);
  const [gameOverReason, setGameOverReason] = useState('');

  // ── Refs (mutable state for game loop) ──
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const fuelRef = useRef(INITIAL_FUEL);
  const livesRef = useRef(INITIAL_LIVES);
  const distanceRef = useRef(0);
  const playerLaneRef = useRef(1);
  const objectsRef = useRef<GameObject[]>([]);
  const objectIdRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const invincibleUntilRef = useRef(0);
  const stageConfigRef = useRef<StageConfig>(getStageConfig(1, 'easy'));
  const renderTimerRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const checkpointStartTimeRef = useRef(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnsweringRef = useRef(false);
  const screenRef = useRef<Screen>('start');
  const isAcceleratingRef = useRef(false);
  const fuelSpawnedRef = useRef(0);
  const hasBonusFuelRef = useRef(false);

  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const { saveSession, resetSaveFlag } = useSaveSession();

  // Keep screenRef in sync
  useEffect(() => { screenRef.current = screen; }, [screen]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ── Touch / keyboard controls ──
  const moveLeft = useCallback(() => {
    playerLaneRef.current = Math.max(0, playerLaneRef.current - 1);
    setPlayerLane(playerLaneRef.current);
  }, []);

  const moveRight = useCallback(() => {
    playerLaneRef.current = Math.min(2, playerLaneRef.current + 1);
    setPlayerLane(playerLaneRef.current);
  }, []);

  const startAccel = useCallback(() => {
    isAcceleratingRef.current = true;
    setIsAccelerating(true);
  }, []);

  const stopAccel = useCallback(() => {
    isAcceleratingRef.current = false;
    setIsAccelerating(false);
  }, []);

  useEffect(() => {
    if (screen !== 'driving') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); startAccel(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === ' ') stopAccel();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, moveLeft, moveRight, startAccel, stopAccel]);

  // Touch swipe
  const touchStartRef = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current;
    if (dx > 30) moveRight();
    else if (dx < -30) moveLeft();
    touchStartRef.current = null;
  }, [moveLeft, moveRight]);

  // ── Game Loop ──
  const gameLoop = useCallback((timestamp: number) => {
    if (screenRef.current !== 'driving') return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = Math.min(timestamp - lastTimeRef.current, 50);
    lastTimeRef.current = timestamp;

    const config = stageConfigRef.current;
    const accel = isAcceleratingRef.current;
    const speedMult = accel ? 1.0 : COAST_SPEED_MULT;
    const drainMult = accel ? 1.0 : COAST_DRAIN_MULT;

    // Update fuel
    fuelRef.current = Math.max(0, fuelRef.current - config.fuelDrain * drainMult * (dt / 16.67));
    if (fuelRef.current <= 0) {
      cancelAnimationFrame(animFrameRef.current);
      setGameOverReason('Hết xăng!');
      setScreen('game-over');
      return;
    }

    // Update distance
    distanceRef.current += config.objectSpeed * speedMult * (dt / 16.67);

    // Spawn fixed fuel at distance milestones (exactly 2 per stage)
    const progress = distanceRef.current / STAGE_DISTANCE;
    if (fuelSpawnedRef.current < FUEL_SPAWN_POINTS.length && progress >= FUEL_SPAWN_POINTS[fuelSpawnedRef.current]) {
      const lane = Math.floor(Math.random() * 3);
      objectsRef.current = [...objectsRef.current, {
        id: ++objectIdRef.current, type: 'fuel', lane, y: -8, emoji: '⛽',
      }];
      fuelSpawnedRef.current++;
    }

    // Spawn obstacles only (no random fuel)
    spawnTimerRef.current += dt;
    if (spawnTimerRef.current >= config.spawnInterval) {
      spawnTimerRef.current = 0;
      const lane = Math.floor(Math.random() * 3);
      objectsRef.current = [...objectsRef.current, {
        id: ++objectIdRef.current,
        type: 'obstacle',
        lane,
        y: -8,
        emoji: OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)],
      }];
    }

    // Move objects + collision
    const now = Date.now();
    const updatedObjects: GameObject[] = [];
    let hitThisFrame = false;
    for (const obj of objectsRef.current) {
      const newY = obj.y + config.objectSpeed * (dt / 16.67);
      if (newY > 110) continue;

      const inCollisionZone = obj.lane === playerLaneRef.current && newY >= 72 && newY <= 88;

      if (inCollisionZone && !hitThisFrame) {
        if (obj.type === 'fuel') {
          fuelRef.current = Math.min(100, fuelRef.current + FUEL_PICKUP_AMOUNT);
          setFuelPickup({ id: obj.id, lane: obj.lane });
          setTimeout(() => setFuelPickup(null), 800);
          continue;
        } else if (now >= invincibleUntilRef.current) {
          hitThisFrame = true;
          livesRef.current -= 1;
          setLives(livesRef.current);
          setIsHit(true);
          setTimeout(() => setIsHit(false), 300);
          invincibleUntilRef.current = now + INVINCIBLE_MS;
          if (livesRef.current <= 0) {
            cancelAnimationFrame(animFrameRef.current);
            setGameOverReason('Hết mạng!');
            setScreen('game-over');
            return;
          }
          continue;
        }
      }
      updatedObjects.push({ ...obj, y: newY });
    }
    objectsRef.current = updatedObjects;

    // Check stage completion
    if (distanceRef.current >= STAGE_DISTANCE && !hitThisFrame) {
      cancelAnimationFrame(animFrameRef.current);
      setScreen('checkpoint');
      return;
    }

    // Throttled render ~20fps
    renderTimerRef.current += dt;
    if (renderTimerRef.current >= 50) {
      renderTimerRef.current = 0;
      setObjects([...objectsRef.current]);
      setFuel(Math.round(fuelRef.current));
      setDistance(Math.round(distanceRef.current));
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // ── Start driving stage ──
  const startDriving = useCallback((stageNum: number, currentFuel: number) => {
    const config = getStageConfig(stageNum, difficulty);
    stageConfigRef.current = config;
    fuelRef.current = currentFuel;
    distanceRef.current = 0;
    objectsRef.current = [];
    spawnTimerRef.current = 0;
    lastTimeRef.current = 0;
    renderTimerRef.current = 0;
    objectIdRef.current = 0;
    playerLaneRef.current = 1;
    invincibleUntilRef.current = 0;
    fuelSpawnedRef.current = 0;
    isAcceleratingRef.current = false;

    setPlayerLane(1);
    setObjects([]);
    setFuel(Math.round(currentFuel));
    setDistance(0);
    setStage(stageNum);
    setIsAccelerating(false);
    setScreen('driving');

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [difficulty, gameLoop]);

  // ── Start Game ──
  const startGame = useCallback(() => {
    resetSaveFlag();
    setIsPlaying(true);
    gameStartTimeRef.current = Date.now();
    setLives(INITIAL_LIVES);
    livesRef.current = INITIAL_LIVES;
    setAllResults([]);
    setMaxStage(1);
    setStreak(0);
    hasBonusFuelRef.current = false;
    startDriving(1, INITIAL_FUEL);
  }, [startDriving, setIsPlaying, resetSaveFlag]);

  // ── Checkpoint logic ──
  const startCheckpointTimer = useCallback((limit: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeft(limit);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (screen !== 'checkpoint') return;
    const config = getStageConfig(stage, difficulty);
    setCheckpointIndex(0);
    setCheckpointCorrect(0);
    setCheckpointResults([]);
    isAnsweringRef.current = false;

    const p = generateMultiplication(undefined, config.mathDifficulty);
    setCheckpointProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    checkpointStartTimeRef.current = Date.now();
    startCheckpointTimer(config.timePerQuestion);
  }, [screen, stage, difficulty, startCheckpointTimer]);

  // Handle checkpoint time up
  useEffect(() => {
    if (screen !== 'checkpoint' || timeLeft > 0 || isAnsweringRef.current) return;
    isAnsweringRef.current = true;

    if (checkpointProblem) {
      setSelectedAnswer(-1);
      setFeedback(false);
      const config = getStageConfig(stage, difficulty);
      const result: ProblemResult = {
        problem: checkpointProblem,
        selectedAnswer: -1,
        isCorrect: false,
        timeMs: config.timePerQuestion * 1000,
        score: 0,
      };
      setCheckpointResults((prev) => [...prev, result]);
    }
    setStreak(0);

    setTimeout(() => nextCheckpointQuestion(), 1200);
  }, [timeLeft, screen]);

  const nextCheckpointQuestion = useCallback(() => {
    const nextIdx = checkpointIndex + 1;
    if (nextIdx >= CHECKPOINT_QUESTIONS) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setScreen('checkpoint-results');
      return;
    }
    const config = getStageConfig(stage, difficulty);
    const p = generateMultiplication(undefined, config.mathDifficulty);
    setCheckpointProblem(p);
    setCheckpointIndex(nextIdx);
    setSelectedAnswer(null);
    setFeedback(null);
    isAnsweringRef.current = false;
    checkpointStartTimeRef.current = Date.now();
    startCheckpointTimer(config.timePerQuestion);
  }, [checkpointIndex, stage, difficulty, startCheckpointTimer]);

  const handleCheckpointAnswer = useCallback((answer: number) => {
    if (!checkpointProblem || selectedAnswer !== null || isAnsweringRef.current) return;
    isAnsweringRef.current = true;
    setSelectedAnswer(answer);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const timeMs = Date.now() - checkpointStartTimeRef.current;
    const isCorrect = answer === checkpointProblem.correctAnswer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);
    setStreak(newStreak);
    setFeedback(isCorrect);

    if (isCorrect) setCheckpointCorrect((c) => c + 1);

    const result: ProblemResult = {
      problem: checkpointProblem,
      selectedAnswer: answer,
      isCorrect,
      timeMs,
      score,
    };
    setCheckpointResults((prev) => [...prev, result]);

    setTimeout(() => nextCheckpointQuestion(), 800);
  }, [checkpointProblem, selectedAnswer, streak, nextCheckpointQuestion]);

  // ── Checkpoint results handling ──
  const handleCheckpointDone = useCallback(() => {
    setAllResults((prev) => [...prev, ...checkpointResults]);
    const passed = checkpointCorrect >= 7;
    const bonus = checkpointCorrect >= 9;

    if (!passed) {
      setGameOverReason('Không qua trạm kiểm tra!');
      setScreen('game-over');
      return;
    }

    // Track bonus for next stage fuel calculation
    hasBonusFuelRef.current = bonus;

    const nextStage = stage + 1;
    setMaxStage(nextStage);

    // Next stage fuel: base INITIAL_FUEL + bonus if earned
    const nextFuel = bonus ? INITIAL_FUEL + BONUS_FUEL_AMOUNT : INITIAL_FUEL;
    startDriving(nextStage, nextFuel);
  }, [checkpointResults, checkpointCorrect, stage, startDriving]);

  // ── Game Over → Results ──
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setAllResults((prev) => [...prev, ...checkpointResults]);
    setScreen('results');
  }, [checkpointResults, setIsPlaying]);

  useEffect(() => {
    if (screen === 'game-over') {
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [screen, setIsPlaying]);

  // ── Star calculation ──
  const totalCorrect = allResults.filter((r) => r.isCorrect).length;
  const stars = ScoreCalculator.calculateGameStars({
    totalProblems: allResults.length,
    correctCount: totalCorrect,
    completion: Math.max(0, Math.min(1, maxStage / 3)),
  });

  // ── Save session ──
  if (screen === 'results' && allResults.length > 0) {
    saveSession({
      type: 'road-fighter',
      results: allResults,
      startedAt: gameStartTimeRef.current,
      starsOverride: stars,
    });
  }

  // ── Derived ──
  const stageConfig = getStageConfig(stage, difficulty);
  const fuelColor = fuel > 50 ? 'bg-green-500' : fuel > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const timerPercent = (timeLeft / stageConfig.timePerQuestion) * 100;
  const progress = distance / STAGE_DISTANCE;

  // Start line: at player position (76%) initially, scrolls down off-screen
  const startLineY = 76 + (progress / 0.08) * 40; // gone after ~8% distance
  const showStartLine = startLineY <= 110;

  // Finish line: scrolls down from above screen to player position at 100%
  const finishLineY = progress >= 0.85
    ? -10 + ((progress - 0.85) / 0.15) * 86  // -10 → 76
    : -999;
  const showFinishLine = progress >= 0.85;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Results Screen ──
  if (screen === 'results') {
    const totalScore = allResults.reduce((s, r) => s + r.score, 0);
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <h1 className="text-4xl font-black mb-2">
              {maxStage >= 3 ? '🏆 Tuyệt vời!' : maxStage >= 2 ? '👏 Giỏi lắm!' : '😅 Cố lên!'}
            </h1>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-3xl font-black text-emerald-600">Stage {maxStage}</div>
                <div className="text-sm text-gray-500">Đạt tới</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-500">Điểm</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-600">
                  {totalCorrect}/{allResults.length}
                </div>
                <div className="text-sm text-gray-500">Đúng</div>
              </div>
            </div>
            {maxStage < 2 && (
              <p className="text-sm text-gray-500 mb-4 bg-yellow-50 rounded-xl p-3">
                💡 Mẹo: Giữ nút tăng tốc, ăn đủ 2 bình xăng, và trả lời đúng {'>'}6/10 câu!
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => { setIsPlaying(false); setScreen('start'); }} variant="ghost" fullWidth>
                Menu
              </Button>
              <Button onClick={startGame} variant="primary" fullWidth>
                Chơi lại 🔄
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Game Over Screen ──
  if (screen === 'game-over') {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <motion.div
              animate={{ x: [-5, 5, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              className="text-7xl mb-4"
            >
              💥
            </motion.div>
            <h1 className="text-3xl font-black text-red-600 mb-2">Game Over!</h1>
            <p className="text-lg text-gray-600 mb-6">{gameOverReason}</p>
            <p className="text-sm text-gray-500 mb-4">Đã đến Stage {stage}</p>
            <div className="flex gap-3">
              <Button onClick={handleGameOver} variant="primary" fullWidth>
                Xem kết quả
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Checkpoint Results Screen ──
  if (screen === 'checkpoint-results') {
    const passed = checkpointCorrect >= 7;
    const bonus = checkpointCorrect >= 9;
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <div className="text-6xl mb-3">{passed ? '✅' : '❌'}</div>
            <h1 className="text-2xl font-black mb-2">
              Trạm kiểm tra Stage {stage}
            </h1>
            <p className="text-4xl font-black mb-2">
              <span className={passed ? 'text-green-600' : 'text-red-600'}>
                {checkpointCorrect}/{CHECKPOINT_QUESTIONS}
              </span>
            </p>
            <p className="text-gray-500 mb-4">
              {passed
                ? bonus
                  ? 'Xuất sắc! Bạn được thưởng thêm xăng cho vòng sau!'
                  : 'Qua trạm! Tiếp tục lái thôi!'
                : 'Chưa đủ điểm qua trạm... (cần ≥7 câu đúng)'}
            </p>

            <AnimatePresence>
              {bonus && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-emerald-100 rounded-2xl p-4 mb-4"
                >
                  <span className="text-3xl">⛽</span>
                  <p className="text-lg font-bold text-emerald-700">+{BONUS_FUEL_AMOUNT}% Bình xăng thưởng!</p>
                  <p className="text-sm text-emerald-600">Vòng sau chỉ cần ăn 1 bình xăng!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={passed ? handleCheckpointDone : () => { handleGameOver(); }}
              variant={passed ? 'success' : 'danger'}
              fullWidth
              size="lg"
            >
              {passed ? 'Tiếp tục lái! 🚗' : 'Xem kết quả'}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Checkpoint (Math) Screen ──
  if (screen === 'checkpoint' && checkpointProblem) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex justify-between text-white text-sm font-bold">
          <span>🏁 Trạm Stage {stage}</span>
          <span className={`tabular-nums ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : timeLeft <= 4 ? 'text-yellow-400' : 'text-white'}`}>
            ⏱ {timeLeft}s
          </span>
          <span>Câu {checkpointIndex + 1}/{CHECKPOINT_QUESTIONS}</span>
        </div>

        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timeLeft <= 2 ? 'bg-red-400' : timeLeft <= 4 ? 'bg-yellow-400' : 'bg-green-400'}`}
            initial={false}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <Card padding="sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-600 font-bold">✅ {checkpointCorrect} đúng</span>
            <span className="text-gray-400">Cần ≥7 để qua</span>
            <span className="text-orange-500 font-bold">🔥 {streak}</span>
          </div>
        </Card>

        <Card className="text-center py-4">
          <div className="text-4xl font-black text-gray-800">
            {checkpointProblem.num1} × {checkpointProblem.num2} = ?
          </div>
        </Card>

        <AnswerOptions
          options={checkpointProblem.options}
          correctAnswer={checkpointProblem.correctAnswer}
          onSelect={handleCheckpointAnswer}
          disabled={selectedAnswer !== null}
          selectedAnswer={selectedAnswer}
        />

        <ResultFeedback isCorrect={feedback} />
      </div>
    );
  }

  // ── Driving Screen ──
  if (screen === 'driving') {
    return (
      <div className="max-w-lg mx-auto space-y-2 select-none">
        {/* HUD */}
        <div className="flex items-center justify-between text-white text-xs font-bold gap-2">
          <span className="bg-white/20 px-2 py-1 rounded-lg">Stage {stage}</span>
          <div className="flex items-center gap-1 flex-1 mx-1">
            <span>⛽</span>
            <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${fuelColor} ${fuel <= 25 ? 'animate-pulse' : ''}`}
                initial={false}
                animate={{ width: `${fuel}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="w-8 text-right">{fuel}%</span>
          </div>
          <span>
            {Array.from({ length: INITIAL_LIVES }, (_, i) => (
              <span key={i} className={i < lives ? '' : 'opacity-30'}>{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </span>
          <span className="bg-white/20 px-2 py-1 rounded-lg">📏 {distance}/{STAGE_DISTANCE}</span>
        </div>

        {/* Road */}
        <div
          className="relative overflow-hidden bg-gray-700 rounded-3xl"
          style={{ height: '50vh' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Green shoulders */}
          <div className="absolute left-0 top-0 bottom-0 w-[12%] bg-green-700 z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-[12%] bg-green-700 z-10" />

          {/* Road surface */}
          <div className="absolute left-[12%] right-[12%] top-0 bottom-0 bg-gray-600">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(255,255,255,0.3) 30px, rgba(255,255,255,0.3) 50px)',
                backgroundSize: '2px 80px',
                backgroundPosition: '33% 0, 66% 0',
                animation: `roadScroll ${isAccelerating ? '0.3s' : '1.5s'} linear infinite`,
              }}
            />
            <div className="absolute top-0 bottom-0" style={{ left: '33%', width: '2px' }}>
              <div className="h-full" style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 20px, transparent 20px, transparent 50px)',
                animation: `roadScroll ${isAccelerating ? '0.3s' : '1.5s'} linear infinite`,
              }} />
            </div>
            <div className="absolute top-0 bottom-0" style={{ left: '66%', width: '2px' }}>
              <div className="h-full" style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 20px, transparent 20px, transparent 50px)',
                animation: `roadScroll ${isAccelerating ? '0.3s' : '1.5s'} linear infinite`,
              }} />
            </div>

            {/* Start line */}
            {showStartLine && (
              <div className="absolute left-0 right-0 z-[5]" style={{ top: `${startLineY}%` }}>
                <div className="h-3" style={{
                  background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 8px, transparent 8px, transparent 16px)',
                  opacity: 0.7,
                }} />
                <div className="text-center text-[10px] font-black text-white/60 mt-0.5">
                  🚦 XUẤT PHÁT
                </div>
              </div>
            )}

            {/* Finish line */}
            {showFinishLine && (
              <div className="absolute left-0 right-0 z-[5]" style={{ top: `${finishLineY}%` }}>
                <div className="text-center text-xs font-black text-yellow-300 mb-0.5">
                  🏁 ĐÍCH 🏁
                </div>
                <div className="h-4" style={{
                  backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)',
                  backgroundSize: '16px 16px',
                }} />
              </div>
            )}

            {/* Game objects */}
            {objects.map((obj) => (
              <motion.div
                key={obj.id}
                className="absolute"
                style={{
                  left: `${(obj.lane + 0.5) * 33.33 - 4}%`,
                  top: `${obj.y}%`,
                }}
                initial={false}
              >
                {obj.type === 'fuel'
                  ? <span className="text-3xl">⛽</span>
                  : <CarTopDown color={OBSTACLE_COLORS[obj.emoji] || '#ef4444'} size={22} />
                }
              </motion.div>
            ))}

            {/* Player car */}
            <motion.div
              className={`absolute z-20 ${isHit ? 'animate-pulse' : ''}`}
              style={{ top: '76%' }}
              animate={{
                left: `${(playerLane + 0.5) * 33.33 - 5}%`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <CarTopDown color={isHit ? '#ff6b6b' : '#3b82f6'} size={28} />
            </motion.div>

            {/* Hit flash */}
            <AnimatePresence>
              {isHit && (
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-red-500/30 z-30"
                />
              )}
            </AnimatePresence>

            {/* Fuel pickup effect */}
            <AnimatePresence>
              {fuelPickup && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -60 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute z-30 text-xl font-black text-green-400"
                  style={{
                    left: `${(fuelPickup.lane + 0.5) * 33.33 - 5}%`,
                    top: '70%',
                  }}
                >
                  +⛽
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls: accelerate + left/right */}
        <div className="space-y-2">
          <button
            onPointerDown={startAccel}
            onPointerUp={stopAccel}
            onPointerLeave={stopAccel}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all select-none active:scale-[0.97] ${
              isAccelerating
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-300'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isAccelerating ? '🔥 TĂNG TỐC!' : '⬆️ Giữ để tăng tốc'}
          </button>
          <div className="flex gap-3">
            <Button onClick={moveLeft} variant="ghost" fullWidth className="bg-white/10 text-white text-lg">
              ← Trái
            </Button>
            <Button onClick={moveRight} variant="ghost" fullWidth className="bg-white/10 text-white text-lg">
              Phải →
            </Button>
          </div>
        </div>

        <style jsx global>{`
          @keyframes roadScroll {
            0% { background-position-y: 0px; }
            100% { background-position-y: 80px; }
          }
        `}</style>
      </div>
    );
  }

  // ── Start Screen ──
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Đua Xe Ăn Xăng ⛽</h1>
      <Card className="text-center">
        <div className="text-6xl mb-4">🏎️⛽</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng lên đường!</h2>
        <p className="text-gray-500 text-sm mb-4">
          Giữ nút tăng tốc để chạy nhanh, ăn xăng để không hết nhiên liệu!
        </p>

        <div className="text-left bg-gray-50 rounded-2xl p-4 mb-4 text-sm space-y-1">
          <p>⬆️ <strong>Giữ tăng tốc</strong> — Nhả ra xe chạy rất chậm</p>
          <p>⛽ <strong>Ăn 2 bình xăng</strong> — Mỗi đường đua có đúng 2 bình</p>
          <p>🚗 <strong>Né xe</strong> — Đổi làn bằng swipe hoặc tap</p>
          <p>🏁 <strong>Trạm kiểm tra</strong> — Giải 10 phép nhân</p>
          <p>✅ <strong>≥7 đúng</strong> = qua vòng, <strong>≥9 đúng</strong> = thưởng xăng!</p>
        </div>

        <h3 className="font-bold text-gray-700 mb-3">Chọn cấp độ:</h3>
        <div className="flex gap-3 mb-6">
          {(['easy', 'medium', 'hard'] as const).map((d) => {
            const cfg = DIFFICULTY_BASE[d];
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

        <Button onClick={startGame} variant="success" fullWidth size="lg">
          Xuất phát! 🚀
        </Button>
      </Card>
    </div>
  );
}
