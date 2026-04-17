'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { getExamById } from '@/data/exams';
import { useExamStore } from '@/stores/useExamStore';
import type { ExamQuestion, ExamSubject, ExamResult } from '@/types/exam';
import ExamTakeView from '@/components/exam/ExamTakeView';
import ExamResultSummary from '@/components/exam/ExamResultSummary';
import ExamReviewMode from '@/components/exam/ExamReviewMode';
import ExamVoiceControl from '@/components/exam/ExamVoiceControl';
import type { VoiceTarget } from '@/components/exam/ExamQuestionView';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { parseAnswerOnly, parseVoiceCommand } from '@/lib/voice/vietnameseParser';

type Mode = 'select' | 'take' | 'review' | 'result';

interface Props {
  subject: ExamSubject;
  examId: string;
  initialMode?: Mode;
}

function findQuestionByNumber(
  questions: ExamQuestion[],
  number: number
): { question: ExamQuestion; index: number; titlePrefix: 'Câu' | 'Bài' } | null {
  const mc = questions.filter((q) => q.sectionId === 'multiple-choice' || !q.sectionId);
  const essay = questions.filter((q) => q.sectionId === 'essay');

  if (number >= 1 && number <= mc.length) {
    return { question: mc[number - 1], index: number - 1, titlePrefix: 'Câu' };
  }
  if (number >= 1 && number <= essay.length) {
    return { question: essay[number - 1], index: number - 1, titlePrefix: 'Bài' };
  }
  return null;
}

export default function ExamDetailClient({ subject, examId, initialMode = 'select' }: Props) {
  const router = useRouter();
  const exam = getExamById(subject, examId);
  const startExam = useExamStore((s) => s.startExam);
  const submitExam = useExamStore((s) => s.submitExam);
  const reset = useExamStore((s) => s.reset);
  const setOptionDraft = useExamStore((s) => s.setOptionDraft);
  const setSlotDraft = useExamStore((s) => s.setSlotDraft);
  const setTextDraft = useExamStore((s) => s.setTextDraft);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);
  const [lastCommandLabel, setLastCommandLabel] = useState<string | null>(null);
  const [activeVoiceTarget, setActiveVoiceTarget] = useState<VoiceTarget | null>(null);
  const slotRefMap = useRef(new Map<string, HTMLInputElement | null>());
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const activeVoiceTargetRef = useRef(activeVoiceTarget);
  activeVoiceTargetRef.current = activeVoiceTarget;

  const scrollToQuestion = useCallback((qid: string) => {
    const el = document.getElementById(`q-${qid}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const flashHighlight = useCallback(
    (qid: string) => {
      setHighlightedQuestionId(qid);
      scrollToQuestion(qid);
      setTimeout(() => setHighlightedQuestionId((cur) => (cur === qid ? null : cur)), 1800);
    },
    [scrollToQuestion]
  );

  const flashCommand = useCallback((label: string) => {
    setLastCommandLabel(label);
    setTimeout(() => setLastCommandLabel(null), 2200);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!exam) return;
    const result = submitExam(exam);
    setExamResult(result);
    setMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [exam, submitExam]);

  const handleVoiceCommand = useCallback(
    (transcript: string) => {
      if (!exam || modeRef.current !== 'take') return;

      // Per-question focused mode
      const target = activeVoiceTargetRef.current;
      if (target) {
        const question = exam.questions.find((q) => q.id === target.questionId);
        if (!question) return;

        if (question.type === 'multiple-choice' && !target.slotId) {
          const res = parseAnswerOnly(transcript, 'option');
          if (res.kind === 'option') {
            setOptionDraft(question.id, res.optionIndex);
            flashCommand(`Đã chọn ${['A', 'B', 'C', 'D'][res.optionIndex]}`);
            setActiveVoiceTarget(null);
          }
          return;
        }

        if (target.slotId && question.answerSlots) {
          const slot = question.answerSlots.find((s) => s.id === target.slotId);
          if (!slot) return;
          const res = parseAnswerOnly(transcript, 'value');
          if (res.kind === 'value') {
            setSlotDraft(question.id, slot.id, res.value);
            flashCommand(`Đã điền: ${res.value}`);
            setActiveVoiceTarget(null);
          }
          return;
        }

        if (!target.slotId && question.type === 'fill-blank') {
          const res = parseAnswerOnly(transcript, 'value');
          if (res.kind === 'value') {
            setTextDraft(question.id, res.value);
            flashCommand(`Đã điền: ${res.value}`);
            setActiveVoiceTarget(null);
          }
          return;
        }
        return;
      }

      // Global command mode (fallback)
      const cmd = parseVoiceCommand(transcript);

      if (cmd.kind === 'submit') {
        flashCommand('Nộp bài');
        handleSubmit();
        return;
      }
      if (cmd.kind === 'noop') return;

      const qTarget = findQuestionByNumber(exam.questions, cmd.questionNumber);
      if (!qTarget) return;
      const { question, index, titlePrefix } = qTarget;
      flashHighlight(question.id);

      if (cmd.kind === 'select-option' && question.type === 'multiple-choice') {
        setOptionDraft(question.id, cmd.optionIndex);
        const letter = ['A', 'B', 'C', 'D'][cmd.optionIndex];
        flashCommand(`${titlePrefix} ${index + 1}: ${letter}`);
        return;
      }

      if (cmd.kind === 'fill-answer') {
        if (question.answerSlots && question.answerSlots.length > 0) {
          let slotId: string | undefined;
          if (cmd.slotLetter) {
            slotId = question.answerSlots.find((s) => s.id === cmd.slotLetter)?.id;
          }
          if (!slotId && question.answerSlots.length === 1) {
            slotId = question.answerSlots[0].id;
          }
          if (slotId) {
            setSlotDraft(question.id, slotId, cmd.value);
            flashCommand(`${titlePrefix} ${index + 1}${cmd.slotLetter ? cmd.slotLetter : ''}: ${cmd.value}`);
            const focusKey = `${question.id}:${slotId}`;
            slotRefMap.current.get(focusKey)?.focus();
          }
          return;
        }
        if (question.type === 'fill-blank') {
          setTextDraft(question.id, cmd.value);
          flashCommand(`${titlePrefix} ${index + 1}: ${cmd.value}`);
          return;
        }
      }
    },
    [exam, flashCommand, flashHighlight, handleSubmit, setOptionDraft, setSlotDraft, setTextDraft]
  );

  const voice = useVoiceRecognition({
    onFinalResult: handleVoiceCommand,
  });

  const handleToggleVoiceTarget = useCallback(
    (target: VoiceTarget) => {
      const current = activeVoiceTargetRef.current;
      const same =
        current &&
        current.questionId === target.questionId &&
        current.slotId === target.slotId;

      if (same) {
        setActiveVoiceTarget(null);
        voice.stop();
        return;
      }

      setActiveVoiceTarget(target);
      if (!voice.isListening) voice.start();
    },
    [voice]
  );

  if (!exam) {
    return <div className="text-white text-center">Không tìm thấy đề thi</div>;
  }

  const handleStartExam = () => {
    startExam(exam.id, subject);
    setExamResult(null);
    setMode('take');
  };

  const handleBackToList = () => {
    voice.stop();
    reset();
    router.push(`/practice/exams/${subject}`);
  };

  if (mode === 'select') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToList}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
          >
            ←
          </motion.button>
          <div>
            <h1 className="text-xl font-black text-white">{exam.title}</h1>
            <p className="text-sm text-white/70">{exam.description}</p>
          </div>
        </div>

        <Card className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <h2 className="text-xl font-bold text-gray-800">{exam.title}</h2>
            {exam.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{exam.subtitle}</p>
            )}
            <div className="flex justify-center flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span>📝 {exam.totalQuestions} câu</span>
              <span>⏱️ {exam.timeMinutes} phút</span>
              <span>⭐ {exam.totalPoints} điểm</span>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleStartExam}
              className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg"
            >
              ✏️ Làm bài
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('review')}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg"
            >
              📖 Xem đề & đáp án
            </motion.button>
          </div>
          {voice.isSupported && (
            <p className="text-center text-xs text-gray-400">
              💡 Trong khi làm bài bạn có thể bấm mic để trả lời bằng giọng nói (tiếng Việt)
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (mode === 'review') {
    return (
      <ExamReviewMode
        exam={exam}
        answers={examResult?.answers}
        onBack={() => (examResult ? setMode('result') : handleBackToList())}
      />
    );
  }

  if (mode === 'result' && examResult) {
    return (
      <div className="max-w-lg mx-auto">
        <ExamResultSummary
          result={examResult}
          onReview={() => setMode('review')}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Take mode
  return (
    <ExamTakeView
      exam={exam}
      highlightedQuestionId={highlightedQuestionId}
      onSubmit={handleSubmit}
      onExit={() => {
        setActiveVoiceTarget(null);
        voice.stop();
        reset();
        handleBackToList();
      }}
      slotRefMap={slotRefMap.current}
      voiceSupported={voice.isSupported}
      activeVoiceTarget={activeVoiceTarget}
      onToggleVoice={handleToggleVoiceTarget}
      voiceSlot={
        <ExamVoiceControl
          isSupported={voice.isSupported}
          isListening={voice.isListening}
          interim={voice.interimTranscript}
          lastCommandLabel={lastCommandLabel}
          error={voice.error}
          onToggle={() => {
            if (voice.isListening) {
              setActiveVoiceTarget(null);
              voice.stop();
            } else {
              voice.start();
            }
          }}
        />
      }
    />
  );
}
