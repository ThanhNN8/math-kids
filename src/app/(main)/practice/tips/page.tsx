'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnswerOptions from '@/components/ui/AnswerOptions';
import ResultFeedback from '@/components/ui/ResultFeedback';
import { useGameStore } from '@/stores/useGameStore';

// --- Types ---
interface Tip {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  examples: TipExample[];
  generateProblem: () => TipProblem;
}

interface TipExample {
  problem: string;
  steps: string[];
  result: string;
}

interface TipProblem {
  display: string;
  hint: string;
  correctAnswer: number;
  options: number[];
}

type Screen = 'menu' | 'learn' | 'practice' | 'done';

// --- Helpers ---
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  const offsets = [1, -1, 2, -2, 5, -5, 10, -10, 3, -3];
  for (const o of offsets) {
    if (opts.size >= 4) break;
    const v = correct + o;
    if (v > 0) opts.add(v);
  }
  while (opts.size < 4) {
    opts.add(correct + Math.floor(Math.random() * 20) - 10 || 1);
  }
  return shuffle(Array.from(opts));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Tips Data ---
const TIPS: Tip[] = [
  {
    id: 'round-ten',
    title: 'Cộng tròn chục',
    icon: '🎯',
    color: 'from-blue-400 to-blue-600',
    description: 'Tách một số để cộng cho tròn 10, 20, 30... rồi cộng phần còn lại.',
    examples: [
      {
        problem: '8 + 5 = ?',
        steps: ['8 + 2 = 10 (cộng cho tròn 10)', '5 − 2 = 3 (còn lại)', '10 + 3 = 13'],
        result: '8 + 5 = 13',
      },
      {
        problem: '17 + 6 = ?',
        steps: ['17 + 3 = 20 (cộng cho tròn 20)', '6 − 3 = 3 (còn lại)', '20 + 3 = 23'],
        result: '17 + 6 = 23',
      },
      {
        problem: '28 + 5 = ?',
        steps: ['28 + 2 = 30 (cộng cho tròn 30)', '5 − 2 = 3 (còn lại)', '30 + 3 = 33'],
        result: '28 + 5 = 33',
      },
    ],
    generateProblem: () => {
      // Generate a + b where a ends in 7,8,9 so rounding to tens is natural
      const tens = randInt(0, 4) * 10;
      const ones = randInt(7, 9);
      const a = tens + ones;
      const b = randInt(3, 9);
      const correct = a + b;
      const complement = 10 - ones;
      return {
        display: `${a} + ${b} = ?`,
        hint: `💡 ${a} + ${complement} = ${a + complement}, rồi + ${b - complement}`,
        correctAnswer: correct,
        options: makeOptions(correct),
      };
    },
  },
  {
    id: 'round-hundred',
    title: 'Cộng tròn trăm',
    icon: '💯',
    color: 'from-purple-400 to-purple-600',
    description: 'Khi hai số cộng lại gần 100, tìm cách làm tròn 100 trước.',
    examples: [
      {
        problem: '67 + 35 = ?',
        steps: ['67 + 33 = 100 (cộng cho tròn 100)', '35 − 33 = 2 (còn lại)', '100 + 2 = 102'],
        result: '67 + 35 = 102',
      },
      {
        problem: '48 + 54 = ?',
        steps: ['48 + 52 = 100 (cộng cho tròn 100)', '54 − 52 = 2 (còn lại)', '100 + 2 = 102'],
        result: '48 + 54 = 102',
      },
      {
        problem: '76 + 28 = ?',
        steps: ['76 + 24 = 100 (cộng cho tròn 100)', '28 − 24 = 4 (còn lại)', '100 + 4 = 104'],
        result: '76 + 28 = 104',
      },
    ],
    generateProblem: () => {
      const a = randInt(45, 85);
      const complement = 100 - a;
      const extra = randInt(1, 15);
      const b = complement + extra;
      const correct = a + b;
      return {
        display: `${a} + ${b} = ?`,
        hint: `💡 ${a} + ${complement} = 100, rồi + ${extra} = ${correct}`,
        correctAnswer: correct,
        options: makeOptions(correct),
      };
    },
  },
  {
    id: 'swap-order',
    title: 'Đổi chỗ để tính nhanh',
    icon: '🔄',
    color: 'from-green-400 to-green-600',
    description: 'Đổi thứ tự các số để ghép cặp tròn chục, giúp tính nhanh hơn.',
    examples: [
      {
        problem: '3 + 8 + 7 = ?',
        steps: ['Đổi: 3 + 7 + 8', '3 + 7 = 10 (tròn chục!)', '10 + 8 = 18'],
        result: '3 + 8 + 7 = 18',
      },
      {
        problem: '6 + 5 + 4 = ?',
        steps: ['Đổi: 6 + 4 + 5', '6 + 4 = 10 (tròn chục!)', '10 + 5 = 15'],
        result: '6 + 5 + 4 = 15',
      },
      {
        problem: '2 + 9 + 8 + 1 = ?',
        steps: ['Đổi: 2 + 8 + 9 + 1', '2 + 8 = 10, 9 + 1 = 10', '10 + 10 = 20'],
        result: '2 + 9 + 8 + 1 = 20',
      },
    ],
    generateProblem: () => {
      // Generate 3 numbers where two of them sum to 10
      const a = randInt(1, 9);
      const b = 10 - a;
      const c = randInt(2, 9);
      const nums = shuffle([a, b, c]);
      const correct = a + b + c;
      return {
        display: `${nums[0]} + ${nums[1]} + ${nums[2]} = ?`,
        hint: `💡 Tìm cặp tròn 10: ${a} + ${b} = 10, rồi + ${c}`,
        correctAnswer: correct,
        options: makeOptions(correct),
      };
    },
  },
  {
    id: 'split-number',
    title: 'Tách số để cộng/trừ',
    icon: '✂️',
    color: 'from-orange-400 to-orange-600',
    description: 'Tách số thành hàng chục và hàng đơn vị, cộng/trừ riêng từng phần.',
    examples: [
      {
        problem: '34 + 25 = ?',
        steps: ['Tách: 30 + 20 = 50 (hàng chục)', 'Tách: 4 + 5 = 9 (hàng đơn vị)', '50 + 9 = 59'],
        result: '34 + 25 = 59',
      },
      {
        problem: '56 − 23 = ?',
        steps: ['Tách: 50 − 20 = 30 (hàng chục)', 'Tách: 6 − 3 = 3 (hàng đơn vị)', '30 + 3 = 33'],
        result: '56 − 23 = 33',
      },
      {
        problem: '47 + 38 = ?',
        steps: ['Tách: 40 + 30 = 70 (hàng chục)', 'Tách: 7 + 8 = 15 (hàng đơn vị)', '70 + 15 = 85'],
        result: '47 + 38 = 85',
      },
    ],
    generateProblem: () => {
      const isAdd = Math.random() > 0.4;
      if (isAdd) {
        const a = randInt(12, 55);
        const b = randInt(12, 44);
        const correct = a + b;
        const tensA = Math.floor(a / 10) * 10;
        const tensB = Math.floor(b / 10) * 10;
        return {
          display: `${a} + ${b} = ?`,
          hint: `💡 ${tensA}+${tensB}=${tensA + tensB}, ${a % 10}+${b % 10}=${(a % 10) + (b % 10)}`,
          correctAnswer: correct,
          options: makeOptions(correct),
        };
      } else {
        const a = randInt(35, 89);
        const bTens = randInt(1, Math.floor(a / 10) - 1) * 10;
        const bOnes = randInt(1, Math.min(a % 10, 8));
        const b = bTens + bOnes;
        const correct = a - b;
        return {
          display: `${a} − ${b} = ?`,
          hint: `💡 ${Math.floor(a / 10) * 10}−${bTens}=${Math.floor(a / 10) * 10 - bTens}, ${a % 10}−${bOnes}=${(a % 10) - bOnes}`,
          correctAnswer: correct,
          options: makeOptions(correct),
        };
      }
    },
  },
  {
    id: 'subtract-round',
    title: 'Trừ bằng cách làm tròn',
    icon: '🎈',
    color: 'from-red-400 to-red-600',
    description: 'Làm tròn số trừ lên hàng chục, trừ xong rồi cộng lại phần thừa.',
    examples: [
      {
        problem: '53 − 28 = ?',
        steps: ['Làm tròn: 28 → 30', '53 − 30 = 23', 'Cộng lại: 23 + 2 = 25 (vì trừ dư 2)'],
        result: '53 − 28 = 25',
      },
      {
        problem: '72 − 37 = ?',
        steps: ['Làm tròn: 37 → 40', '72 − 40 = 32', 'Cộng lại: 32 + 3 = 35 (vì trừ dư 3)'],
        result: '72 − 37 = 35',
      },
      {
        problem: '85 − 49 = ?',
        steps: ['Làm tròn: 49 → 50', '85 − 50 = 35', 'Cộng lại: 35 + 1 = 36 (vì trừ dư 1)'],
        result: '85 − 49 = 36',
      },
    ],
    generateProblem: () => {
      // b ends in 6,7,8,9 so rounding up is natural
      const bTens = randInt(2, 5) * 10;
      const bOnes = randInt(6, 9);
      const b = bTens + bOnes;
      const a = b + randInt(8, 35);
      const correct = a - b;
      const rounded = bTens + 10;
      const diff = rounded - b;
      return {
        display: `${a} − ${b} = ?`,
        hint: `💡 ${a} − ${rounded} = ${a - rounded}, rồi + ${diff} = ${correct}`,
        correctAnswer: correct,
        options: makeOptions(correct),
      };
    },
  },
  {
    id: 'double-half',
    title: 'Nhân đôi & Chia đôi',
    icon: '✖️',
    color: 'from-pink-400 to-pink-600',
    description: 'Nhân đôi một số rồi cộng/trừ để tính nhanh phép nhân gần.',
    examples: [
      {
        problem: '6 × 5 = ?',
        steps: ['6 × 5 = 6 × 10 ÷ 2', '6 × 10 = 60', '60 ÷ 2 = 30'],
        result: '6 × 5 = 30',
      },
      {
        problem: '7 × 4 = ?',
        steps: ['7 × 4 = 7 × 2 × 2', '7 × 2 = 14', '14 × 2 = 28'],
        result: '7 × 4 = 28',
      },
      {
        problem: '15 + 15 = ?',
        steps: ['15 + 15 = 15 × 2', '= (10 + 5) × 2', '= 20 + 10 = 30'],
        result: '15 + 15 = 30',
      },
    ],
    generateProblem: () => {
      // Generate × 4 or × 5 problems
      const a = randInt(3, 12);
      const useFive = Math.random() > 0.5;
      if (useFive) {
        const correct = a * 5;
        return {
          display: `${a} × 5 = ?`,
          hint: `💡 ${a} × 10 = ${a * 10}, chia đôi = ${correct}`,
          correctAnswer: correct,
          options: makeOptions(correct),
        };
      } else {
        const correct = a * 4;
        return {
          display: `${a} × 4 = ?`,
          hint: `💡 ${a} × 2 = ${a * 2}, nhân đôi = ${correct}`,
          correctAnswer: correct,
          options: makeOptions(correct),
        };
      }
    },
  },
];

const PRACTICE_COUNT = 10;

export default function TipsPage() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1); // -1 = show problem only
  const [showResult, setShowResult] = useState(false);

  // Practice state
  const [problem, setProblem] = useState<TipProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);

  const openTip = (tip: Tip) => {
    setSelectedTip(tip);
    setExampleIdx(0);
    setStepIdx(-1);
    setShowResult(false);
    setScreen('learn');
  };

  const nextStep = () => {
    if (!selectedTip) return;
    const example = selectedTip.examples[exampleIdx];
    if (stepIdx < example.steps.length - 1) {
      setStepIdx((s) => s + 1);
    } else if (!showResult) {
      setShowResult(true);
    } else if (exampleIdx < selectedTip.examples.length - 1) {
      // Next example
      setExampleIdx((i) => i + 1);
      setStepIdx(-1);
      setShowResult(false);
    }
  };

  const startPractice = useCallback(() => {
    if (!selectedTip) return;
    setPracticeCount(0);
    setCorrectCount(0);
    setIsPlaying(true);
    const p = selectedTip.generateProblem();
    setProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setScreen('practice');
  }, [selectedTip]);

  const handleAnswer = useCallback((answer: number) => {
    if (!problem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === problem.correctAnswer;
    setFeedback(isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
    setPracticeCount((c) => c + 1);
  }, [problem, selectedAnswer]);

  const nextPractice = useCallback(() => {
    if (!selectedTip) return;
    if (practiceCount >= PRACTICE_COUNT) {
      setIsPlaying(false);
      setScreen('done');
      return;
    }
    const p = selectedTip.generateProblem();
    setProblem(p);
    setSelectedAnswer(null);
    setFeedback(null);
    setShowHint(false);
  }, [selectedTip, practiceCount]);

  // Done screen
  if (screen === 'done') {
    const pct = Math.round((correctCount / PRACTICE_COUNT) * 100);
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="text-center">
            <div className="text-5xl mb-3">{pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Tốt lắm!' : 'Cố lên nào!'}
            </h1>
            <p className="text-gray-500 mb-4">
              Mẹo: <span className="font-bold text-blue-600">{selectedTip?.title}</span>
            </p>
            <div className="text-4xl font-black text-green-600 mb-1">{correctCount}/{PRACTICE_COUNT}</div>
            <div className="text-sm text-gray-500 mb-6">câu đúng ({pct}%)</div>
            <div className="flex gap-3">
              <Button onClick={() => setScreen('menu')} variant="ghost" fullWidth>Chọn mẹo khác</Button>
              <Button onClick={() => { if (selectedTip) openTip(selectedTip); }} variant="ghost" fullWidth>Xem lại lý thuyết</Button>
              <Button onClick={startPractice} variant="primary" fullWidth>Luyện lại</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Practice screen
  if (screen === 'practice' && problem && selectedTip) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => { setIsPlaying(false); setScreen('learn'); }} variant="ghost" size="sm">← Quay lại</Button>
          <span className="text-white font-bold text-sm">{selectedTip.icon} {selectedTip.title}</span>
          <span className="text-white/80 text-sm font-bold">{practiceCount + 1}/{PRACTICE_COUNT}</span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: PRACTICE_COUNT }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < practiceCount
                  ? 'bg-green-400'
                  : i === practiceCount
                    ? 'bg-white scale-125'
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <Card className="text-center py-6">
          <motion.div
            key={practiceCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-gray-800 mb-2"
          >
            {problem.display}
          </motion.div>

          {/* Hint button */}
          {!showHint && selectedAnswer === null && (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-blue-500 font-bold hover:underline mt-2"
            >
              Cần gợi ý? 💡
            </button>
          )}

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800 font-medium">
                  {problem.hint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <AnswerOptions
          options={problem.options}
          correctAnswer={problem.correctAnswer}
          onSelect={handleAnswer}
          disabled={selectedAnswer !== null}
          selectedAnswer={selectedAnswer}
        />

        {selectedAnswer !== null && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-3">
            {/* Always show hint after answering */}
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800 font-medium text-center">
              {problem.hint}
            </div>
            <Button onClick={nextPractice} variant="primary" size="lg" fullWidth>
              {practiceCount >= PRACTICE_COUNT ? 'Xem kết quả →' : 'Câu tiếp →'}
            </Button>
          </motion.div>
        )}

        <ResultFeedback isCorrect={feedback} />
      </div>
    );
  }

  // Learn screen
  if (screen === 'learn' && selectedTip) {
    const example = selectedTip.examples[exampleIdx];
    const isLastExample = exampleIdx >= selectedTip.examples.length - 1;
    const isLastStep = stepIdx >= example.steps.length - 1;
    const canPractice = isLastExample && isLastStep && showResult;

    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => setScreen('menu')} variant="ghost" size="sm">← Quay lại</Button>
          <span className="text-white font-bold">{selectedTip.icon} {selectedTip.title}</span>
          <span className="text-white/60 text-sm">
            VD {exampleIdx + 1}/{selectedTip.examples.length}
          </span>
        </div>

        {/* Explanation */}
        <Card className={`bg-gradient-to-br ${selectedTip.color} text-white border-none`}>
          <p className="text-sm font-medium">{selectedTip.description}</p>
        </Card>

        {/* Example display */}
        <Card className="text-center">
          <motion.div
            key={`${exampleIdx}`}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="text-3xl font-black text-gray-800 mb-4">{example.problem}</div>

            {/* Steps revealed one by one */}
            <div className="space-y-2 mb-4">
              {example.steps.map((step, i) => (
                <AnimatePresence key={i}>
                  {i <= stepIdx && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-blue-50 rounded-xl px-4 py-2 text-sm text-blue-800 font-medium text-left flex items-start gap-2"
                    >
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-50 rounded-xl px-4 py-3 text-lg font-black text-green-700"
                >
                  ✅ {example.result}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {!canPractice ? (
            <Button onClick={nextStep} variant="primary" fullWidth size="lg">
              {stepIdx < 0
                ? 'Xem cách làm 👀'
                : !isLastStep
                  ? `Bước tiếp (${stepIdx + 2}/${example.steps.length}) →`
                  : !showResult
                    ? 'Xem kết quả ✨'
                    : 'Ví dụ tiếp →'}
            </Button>
          ) : (
            <Button onClick={startPractice} variant="success" fullWidth size="lg">
              Luyện tập ngay! 🚀
            </Button>
          )}
        </div>

        {/* Example dots */}
        <div className="flex justify-center gap-2">
          {selectedTip.examples.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === exampleIdx ? 'bg-white scale-125' : i < exampleIdx ? 'bg-white/60' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Menu screen
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-black text-white text-center">Mẹo Tính Nhanh ⚡</h1>
      <p className="text-white/70 text-sm text-center">
        Học các mẹo giúp cộng, trừ, nhân nhanh hơn!
      </p>

      {TIPS.map((tip, i) => (
        <motion.div
          key={tip.id}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card onClick={() => openTip(tip)} className="flex items-center gap-4 hover:shadow-xl">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-2xl shrink-0`}>
              {tip.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{tip.title}</h2>
              <p className="text-xs text-gray-500 line-clamp-2">{tip.description}</p>
            </div>
            <span className="text-gray-300 text-xl">›</span>
          </Card>
        </motion.div>
      ))}

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <h3 className="font-bold text-gray-700 mb-2">💡 Cách học hiệu quả</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Xem ví dụ từng bước trước khi luyện</li>
          <li>• Bấm <span className="font-bold text-blue-600">"Cần gợi ý?"</span> nếu chưa nhớ cách</li>
          <li>• Mỗi ngày luyện 1-2 mẹo, không cần vội!</li>
        </ul>
      </Card>
    </div>
  );
}
