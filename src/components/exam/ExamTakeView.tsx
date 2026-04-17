'use client';

import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Exam } from '@/types/exam';
import { useExamStore } from '@/stores/useExamStore';
import ExamHeader from './ExamHeader';
import ExamSection from './ExamSection';
import ExamQuestionView, { VoiceTarget } from './ExamQuestionView';

interface Props {
  exam: Exam;
  highlightedQuestionId?: string | null;
  onSubmit: () => void;
  onExit: () => void;
  voiceSlot?: React.ReactNode;
  slotRefMap: Map<string, HTMLInputElement | null>;
  voiceSupported?: boolean;
  activeVoiceTarget?: VoiceTarget | null;
  onToggleVoice?: (target: VoiceTarget) => void;
}

export default function ExamTakeView({
  exam,
  highlightedQuestionId,
  onSubmit,
  onExit,
  voiceSlot,
  slotRefMap,
  voiceSupported,
  activeVoiceTarget,
  onToggleVoice,
}: Props) {
  const draftAnswers = useExamStore((s) => s.draftAnswers);
  const setOptionDraft = useExamStore((s) => s.setOptionDraft);
  const setSlotDraft = useExamStore((s) => s.setSlotDraft);
  const setTextDraft = useExamStore((s) => s.setTextDraft);

  const mcQuestions = useMemo(
    () => exam.questions.filter((q) => q.sectionId === 'multiple-choice' || !q.sectionId),
    [exam.questions]
  );
  const essayQuestions = useMemo(
    () => exam.questions.filter((q) => q.sectionId === 'essay'),
    [exam.questions]
  );

  const mcSection = exam.sections?.find((s) => s.id === 'multiple-choice');
  const essaySection = exam.sections?.find((s) => s.id === 'essay');

  const answeredCount = exam.questions.filter((q) => {
    const d = draftAnswers[q.id];
    if (!d) return false;
    if (q.type === 'multiple-choice') return d.selectedOptionIndex !== undefined;
    if (q.answerSlots) return q.answerSlots.every((s) => (d.slotValues?.[s.id] ?? '').trim() !== '');
    return (d.textAnswer ?? '').trim() !== '';
  }).length;

  const progressRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ✕
        </motion.button>
        <div className="flex-1" />
        {voiceSlot}
      </div>

      <ExamHeader exam={exam} />

      {voiceSlot && (
        <div className="bg-white/10 rounded-xl px-4 py-2 text-xs text-white/80 text-center">
          🎤 Ví dụ: <b>&quot;Câu 1 chọn B&quot;</b> · <b>&quot;Bài 2 là 14&quot;</b> · <b>&quot;Bài 1 a là 474&quot;</b> · <b>&quot;Nộp bài&quot;</b>
        </div>
      )}

      <div
        ref={progressRef}
        className="sticky top-2 z-20 bg-white/90 backdrop-blur rounded-xl shadow-md px-4 py-2 flex items-center gap-3"
      >
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">
            Đã làm {answeredCount}/{exam.totalQuestions} câu
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${(answeredCount / exam.totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm shadow hover:bg-green-600"
        >
          Nộp bài 📤
        </button>
      </div>

      {mcSection && mcQuestions.length > 0 && (
        <ExamSection section={mcSection}>
          {mcQuestions.map((q, i) => (
            <ExamQuestionView
              key={q.id}
              question={q}
              displayNumber={i + 1}
              titlePrefix="Câu"
              mode="take"
              highlighted={highlightedQuestionId === q.id}
              draft={draftAnswers[q.id]}
              onSelectOption={(idx) => setOptionDraft(q.id, idx)}
              onChangeText={(v) => setTextDraft(q.id, v)}
              onChangeSlot={(slotId, v) => setSlotDraft(q.id, slotId, v)}
              slotRefMap={slotRefMap}
              voiceSupported={voiceSupported}
              activeVoiceTarget={activeVoiceTarget}
              onToggleVoice={onToggleVoice}
            />
          ))}
        </ExamSection>
      )}

      {essaySection && essayQuestions.length > 0 && (
        <ExamSection section={essaySection}>
          {essayQuestions.map((q, i) => (
            <ExamQuestionView
              key={q.id}
              question={q}
              displayNumber={i + 1}
              titlePrefix="Bài"
              mode="take"
              highlighted={highlightedQuestionId === q.id}
              draft={draftAnswers[q.id]}
              onSelectOption={(idx) => setOptionDraft(q.id, idx)}
              onChangeText={(v) => setTextDraft(q.id, v)}
              onChangeSlot={(slotId, v) => setSlotDraft(q.id, slotId, v)}
              slotRefMap={slotRefMap}
              voiceSupported={voiceSupported}
              activeVoiceTarget={activeVoiceTarget}
              onToggleVoice={onToggleVoice}
            />
          ))}
        </ExamSection>
      )}

      {!mcSection && !essaySection && (
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-md space-y-5">
          {exam.questions.map((q, i) => (
            <ExamQuestionView
              key={q.id}
              question={q}
              displayNumber={i + 1}
              mode="take"
              highlighted={highlightedQuestionId === q.id}
              draft={draftAnswers[q.id]}
              onSelectOption={(idx) => setOptionDraft(q.id, idx)}
              onChangeText={(v) => setTextDraft(q.id, v)}
              onChangeSlot={(slotId, v) => setSlotDraft(q.id, slotId, v)}
              slotRefMap={slotRefMap}
              voiceSupported={voiceSupported}
              activeVoiceTarget={activeVoiceTarget}
              onToggleVoice={onToggleVoice}
            />
          ))}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-green-600"
      >
        📤 Nộp bài
      </motion.button>
    </div>
  );
}
