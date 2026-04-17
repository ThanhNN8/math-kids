'use client';

import { forwardRef } from 'react';
import type { ExamQuestion, ExamAnswer } from '@/types/exam';
import type { ExamDraftAnswer } from '@/stores/useExamStore';
import ExamQuestionCard from './ExamQuestionCard';
import ExamMediaRenderer from './media/ExamMediaRenderer';
import MicButton from './MicButton';

export interface VoiceTarget {
  questionId: string;
  slotId?: string;
}

export interface ExamQuestionViewProps {
  question: ExamQuestion;
  displayNumber: number | string;
  titlePrefix?: string;
  mode: 'take' | 'review';
  highlighted?: boolean;

  // Take mode
  draft?: ExamDraftAnswer;
  onSelectOption?: (optionIndex: number) => void;
  onChangeText?: (value: string) => void;
  onChangeSlot?: (slotId: string, value: string) => void;
  slotRefMap?: Map<string, HTMLInputElement | null>;

  // Voice
  voiceSupported?: boolean;
  activeVoiceTarget?: VoiceTarget | null;
  onToggleVoice?: (target: VoiceTarget) => void;

  // Review mode
  answer?: ExamAnswer;
}

const optionLetters = ['A', 'B', 'C', 'D', 'E'];

const ExamQuestionView = forwardRef<HTMLDivElement, ExamQuestionViewProps>(
  function ExamQuestionView(
    {
      question,
      displayNumber,
      titlePrefix = 'Câu',
      mode,
      highlighted,
      draft,
      onSelectOption,
      onChangeText,
      onChangeSlot,
      slotRefMap,
      voiceSupported,
      activeVoiceTarget,
      onToggleVoice,
      answer,
    },
    ref
  ) {
    const showAnswers = mode === 'review';
    const isInteractive = mode === 'take';
    const showVoice = isInteractive && voiceSupported && !!onToggleVoice;
    const questionMicActive =
      !!activeVoiceTarget &&
      activeVoiceTarget.questionId === question.id &&
      !activeVoiceTarget.slotId;

    return (
      <div ref={ref} id={`q-${question.id}`} className="scroll-mt-24">
        <ExamQuestionCard
          number={displayNumber}
          titlePrefix={titlePrefix}
          pointsLabel={question.pointsLabel}
          questionText={question.questionText}
          highlighted={highlighted}
          id={question.id}
        >
          {question.passage && (
            <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-300 px-3 py-2 rounded text-sm text-gray-700 whitespace-pre-line">
              <div className="text-xs text-yellow-700 font-bold mb-1">📖 Bài đọc</div>
              {question.passage}
            </div>
          )}

          {question.media && (
            <ExamMediaRenderer media={question.media} showAnswers={showAnswers} />
          )}

          {/* Multiple choice options */}
          {question.type === 'multiple-choice' && question.options && (
            <>
              {showVoice && (
                <div className="flex items-center gap-2 mt-3">
                  <MicButton
                    size="sm"
                    active={questionMicActive}
                    onClick={() => onToggleVoice?.({ questionId: question.id })}
                    title="Nói A, B, C hoặc D"
                  />
                  <span className="text-xs text-gray-500">
                    {questionMicActive ? 'Đang nghe… hãy nói A, B, C hoặc D' : 'Hoặc nói đáp án'}
                  </span>
                </div>
              )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {question.options.map((opt, idx) => {
                const letter = optionLetters[idx] ?? `${idx + 1}`;
                const selected = draft?.selectedOptionIndex === idx;
                const isCorrect = idx === question.correctOptionIndex;
                const selectedInReview = answer?.selectedOptionIndex === idx;

                let style =
                  'bg-white border-2 border-indigo-100 text-gray-700 hover:border-indigo-400';

                if (mode === 'take') {
                  if (selected) {
                    style = 'bg-indigo-500 border-2 border-indigo-500 text-white';
                  }
                } else {
                  if (isCorrect) {
                    style = 'bg-green-100 border-2 border-green-500 text-green-800 font-semibold';
                  } else if (selectedInReview) {
                    style = 'bg-red-100 border-2 border-red-400 text-red-700 line-through';
                  } else {
                    style = 'bg-gray-50 border-2 border-gray-200 text-gray-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={mode === 'review'}
                    onClick={() => onSelectOption?.(idx)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${style}`}
                  >
                    <span className="font-bold mr-2">{letter}.</span>
                    {opt}
                    {mode === 'review' && isCorrect && ' ✓'}
                  </button>
                );
              })}
            </div>
            </>
          )}

          {/* Single fill-blank */}
          {question.type === 'fill-blank' && !question.answerSlots && (
            <div className="mt-3 space-y-2">
              {mode === 'take' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft?.textAnswer ?? ''}
                    onChange={(e) => onChangeText?.(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                    className="flex-1 px-3 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none text-gray-800"
                  />
                  {showVoice && (
                    <MicButton
                      size="md"
                      active={questionMicActive}
                      onClick={() => onToggleVoice?.({ questionId: question.id })}
                      title="Nói đáp án"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-green-100 border-2 border-green-400 text-green-800 font-semibold rounded-lg">
                    Đáp án: {question.correctAnswer}
                  </div>
                  {answer?.textAnswer && !answer.isCorrect && (
                    <div className="px-3 py-2 bg-red-100 border-2 border-red-300 text-red-700 rounded-lg text-sm">
                      Em trả lời: {answer.textAnswer || '(chưa điền)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Multi-slot fill / essay */}
          {question.answerSlots && (
            <div className="mt-3 space-y-2">
              {question.answerSlots.map((slot) => {
                const value = draft?.slotValues?.[slot.id] ?? '';
                const slotAns = answer?.slotAnswers?.find((s) => s.slotId === slot.id);
                const isCorrect = slotAns?.isCorrect;
                const slotMicActive =
                  !!activeVoiceTarget &&
                  activeVoiceTarget.questionId === question.id &&
                  activeVoiceTarget.slotId === slot.id;

                return (
                  <div key={slot.id} className="flex flex-wrap items-center gap-2">
                    {slot.label && (
                      <label className="text-sm font-medium text-gray-700">
                        {slot.label}
                      </label>
                    )}
                    {mode === 'take' ? (
                      <>
                      <input
                        ref={(el) => {
                          if (slotRefMap) slotRefMap.set(`${question.id}:${slot.id}`, el);
                        }}
                        type="text"
                        value={value}
                        onChange={(e) => onChangeSlot?.(slot.id, e.target.value)}
                        placeholder={slot.placeholder ?? '?'}
                        className="w-24 px-2 py-1 border-2 border-indigo-200 rounded-md text-center font-mono font-bold text-gray-800 focus:border-indigo-500 outline-none"
                      />
                      {showVoice && (
                        <MicButton
                          size="sm"
                          active={slotMicActive}
                          onClick={() =>
                            onToggleVoice?.({ questionId: question.id, slotId: slot.id })
                          }
                          title={`Nói đáp án ${slot.label ?? ''}`}
                        />
                      )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded font-mono font-bold ${
                            isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-700 line-through'
                          }`}
                        >
                          {slotAns?.submitted || '(chưa điền)'}
                        </span>
                        {!isCorrect && (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-mono font-bold">
                            → {slot.correctAnswer}
                          </span>
                        )}
                      </div>
                    )}
                    {slot.unit && <span className="text-gray-500 text-sm">{slot.unit}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Review-only: solution box */}
          {mode === 'review' && (question.explanation || question.solutionSteps) && (
            <div className="mt-4 space-y-2">
              {question.explanation && (
                <div className="bg-green-50 border-l-4 border-green-500 px-4 py-3 rounded-lg">
                  <div className="font-bold text-green-700 text-sm mb-1">
                    Đáp án:{' '}
                    {question.type === 'multiple-choice' && question.correctOptionIndex !== undefined
                      ? optionLetters[question.correctOptionIndex]
                      : question.correctAnswer ?? ''}
                  </div>
                  <div className="text-sm text-gray-700 italic">{question.explanation}</div>
                </div>
              )}
              {question.solutionSteps && question.solutionSteps.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-400 px-4 py-3 rounded-lg">
                  <div className="font-bold text-orange-700 text-sm mb-1">Bài giải:</div>
                  <ul className="text-sm text-gray-700 space-y-1 list-none">
                    {question.solutionSteps.map((step, i) => (
                      <li key={i} className="pl-2">
                        {step}
                      </li>
                    ))}
                  </ul>
                  {question.solutionResult && (
                    <div className="mt-2 text-orange-700 font-bold">
                      {question.solutionResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ExamQuestionCard>
      </div>
    );
  }
);

export default ExamQuestionView;
