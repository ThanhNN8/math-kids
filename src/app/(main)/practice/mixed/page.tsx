'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
import { useSpeech } from '@/hooks/useSpeech';
import { useSaveSession } from '@/hooks/useSaveSession';
import type { MathProblem, ProblemResult } from '@/types';

type Screen = 'setup' | 'quiz' | 'results';

export default function MixedMultiplicationPage() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const { saveSession, resetSaveFlag } = useSaveSession();
  const startTimeRef = useRef<number>(0);
  const quizStartTimeRef = useRef(0);
  const difficultyRef = useRef(new DifficultyManager());

  const TOTAL_PROBLEMS = 20;

  const toggleTable = (table: number) => {
    setSelectedTables((prev) =>
      prev.includes(table)
        ? prev.length > 1 ? prev.filter((t) => t !== table) : prev
        : [...prev, table].sort()
    );
  };

  const getRandomTable = useCallback(() => {
    return selectedTables[Math.floor(Math.random() * selectedTables.length)];
  }, [selectedTables]);

  const startQuiz = useCallback(() => {
    setResults([]);
    setProblemCount(0);
    setStreak(0);
    setTotalScore(0);
    difficultyRef.current.reset();
    const problem = generateMultiplication(getRandomTable(), 1);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setFeedbackResult(null);
    startTimeRef.current = Date.now();
    resetSaveFlag();
    quizStartTimeRef.current = Date.now();
    setIsPlaying(true);
    setScreen('quiz');
  }, [getRandomTable]);

  const handleAnswer = useCallback((answer: number) => {
    if (!currentProblem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const timeMs = Date.now() - startTimeRef.current;
    const isCorrect = answer === currentProblem.correctAnswer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const { score } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);

    setStreak(newStreak);
    if (isCorrect) setTotalScore((s) => s + score);
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
    setProblemCount((c) => c + 1);
  }, [currentProblem, selectedAnswer, streak]);

  const nextProblem = useCallback(() => {
    if (problemCount + 1 >= TOTAL_PROBLEMS) {
      setIsPlaying(false);
      setScreen('results');
      return;
    }
    const problem = generateMultiplication(getRandomTable(), difficultyRef.current.difficulty);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setFeedbackResult(null);
    startTimeRef.current = Date.now();
  }, [problemCount, getRandomTable]);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const stars = ScoreCalculator.calculateStars(results.length, correctCount);

  // Save session when entering results
  if (screen === 'results' && results.length > 0) {
    saveSession({ type: 'mixed', results, startedAt: quizStartTimeRef.current });
  }

  if (screen === 'results') {
    const avgTime = results.length > 0
      ? (results.reduce((s, r) => s + r.timeMs, 0) / results.length / 1000).toFixed(1)
      : '0';

    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center bg-gradient-to-b from-pink-50 to-white">
            <h1 className="text-3xl font-black text-gray-800 mb-2">Hoàn thành! 🎉</h1>
            <p className="text-gray-500 text-sm mb-3">
              Bảng: {selectedTables.join(', ')}
            </p>
            <div className="flex justify-center mb-4">
              <StarRating stars={stars} size="lg" />
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div>
                <div className="text-2xl font-black text-blue-600">{totalScore}</div>
                <div className="text-xs text-gray-500">Điểm</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-600">
                  {results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">Chính xác</div>
              </div>
              <div>
                <div className="text-2xl font-black text-purple-600">{correctCount}/{results.length}</div>
                <div className="text-xs text-gray-500">Đúng</div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-600">{avgTime}s</div>
                <div className="text-xs text-gray-500">TB/câu</div>
              </div>
            </div>

            {/* Per-table breakdown */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-left">
              <h3 className="font-bold text-gray-700 text-sm mb-2">Chi tiết từng bảng:</h3>
              <div className="space-y-1">
                {selectedTables.map((table) => {
                  const tableResults = results.filter((r) => r.problem.num1 === table || r.problem.num2 === table);
                  const tableCorrect = tableResults.filter((r) => r.isCorrect).length;
                  const tableAcc = tableResults.length > 0 ? Math.round((tableCorrect / tableResults.length) * 100) : 0;
                  return (
                    <div key={table} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">Bảng {table}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-gray-400">{tableCorrect}/{tableResults.length}</span>
                        <span className={`font-bold ${tableAcc >= 90 ? 'text-green-600' : tableAcc >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {tableAcc}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setIsPlaying(false); setScreen('setup'); }} variant="ghost" fullWidth>
                Chọn lại bảng
              </Button>
              <Button onClick={startQuiz} variant="primary" fullWidth>
                Chơi lại 🔄
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (screen === 'quiz' && currentProblem) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => { setIsPlaying(false); setScreen('setup'); }} variant="ghost" size="sm">← Thoát</Button>
          <div className="text-white font-bold text-sm">
            Bảng {selectedTables.join(', ')}
          </div>
          <div className="text-white/80 text-sm font-bold">{problemCount + 1}/{TOTAL_PROBLEMS}</div>
        </div>

        <ProgressBar value={problemCount} max={TOTAL_PROBLEMS} color="purple" height="sm" />

        <div className="flex justify-between text-white/80 text-sm font-bold">
          <span>Điểm: {totalScore}</span>
          <span>🔥 {streak}</span>
        </div>

        {/* Auto-speak toggle */}
        <div className="flex justify-end">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
              autoSpeak ? 'bg-pink-500 text-white' : 'bg-white/20 text-white/60'
            }`}
          >
            {autoSpeak ? '🔊' : '🔇'} Đọc đề
          </motion.button>
        </div>

        <Card className="text-center py-8">
          <MathProblemDisplay problem={currentProblem} size="xl" autoSpeak={autoSpeak} />
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

  // Setup screen - choose which tables to mix
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Nhân Hỗn Hợp 🔀</h1>

      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Chọn các bảng muốn trộn:</h2>
        <p className="text-sm text-gray-500 mb-4">
          Chọn ít nhất 2 bảng để luyện nhân xen kẽ, giúp bé nhớ lâu hơn!
        </p>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((table) => (
            <motion.button
              key={table}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleTable(table)}
              className={`h-16 rounded-2xl text-2xl font-black shadow-md transition-all ${
                selectedTables.includes(table)
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white ring-2 ring-pink-300'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {table}
            </motion.button>
          ))}
        </div>

        <div className="bg-pink-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-pink-700 font-medium">
            Đã chọn: <span className="font-bold">Bảng {selectedTables.join(', ')}</span>
          </p>
          <p className="text-xs text-pink-500 mt-1">
            {TOTAL_PROBLEMS} câu hỏi sẽ được trộn ngẫu nhiên từ các bảng đã chọn
          </p>
        </div>

        <Button
          onClick={startQuiz}
          variant="primary"
          fullWidth
          size="lg"
          disabled={selectedTables.length < 1}
        >
          Bắt đầu luyện! 🚀
        </Button>
      </Card>

      <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
        <h3 className="font-bold text-gray-700 mb-2">💡 Tại sao nên luyện hỗn hợp?</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Trộn nhiều bảng giúp bé <span className="font-bold text-pink-600">nhớ lâu hơn</span></li>
          <li>• Không bị nhầm lẫn giữa các bảng gần giống nhau</li>
          <li>• Rèn luyện phản xạ nhanh khi gặp đề ngẫu nhiên</li>
        </ul>
      </Card>
    </div>
  );
}
