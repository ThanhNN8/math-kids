'use client';

import { ExamQuestion } from '@/types/exam';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import FillInBlankQuestion from './FillInBlankQuestion';

interface ExamQuestionRendererProps {
  question: ExamQuestion;
  onAnswer: (answer: { selectedOptionIndex?: number; textAnswer?: string; isCorrect: boolean }) => void;
  disabled?: boolean;
  showResult?: boolean;
  selectedOptionIndex?: number;
  submittedTextAnswer?: string;
}

export default function ExamQuestionRenderer({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  selectedOptionIndex,
  submittedTextAnswer,
}: ExamQuestionRendererProps) {
  const handleMultipleChoiceSelect = (index: number) => {
    const isCorrect = index === question.correctOptionIndex;
    onAnswer({ selectedOptionIndex: index, isCorrect });
  };

  const handleFillBlankSubmit = (answer: string) => {
    const acceptable = question.acceptableAnswers || [question.correctAnswer || ''];
    const isCorrect = acceptable.some(
      (a) => a.toLowerCase().trim() === answer.toLowerCase().trim()
    );
    onAnswer({ textAnswer: answer, isCorrect });
  };

  return (
    <div className="space-y-4">
      {/* Passage for reading questions */}
      {question.passage && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-base leading-relaxed text-gray-700">
          <div className="text-xs font-bold text-yellow-600 mb-2">📖 Bài đọc:</div>
          <div className="whitespace-pre-line">{question.passage}</div>
        </div>
      )}

      {/* Question text */}
      <div className="text-lg font-bold text-gray-800 leading-relaxed">
        {question.questionText}
      </div>

      {/* Render based on type */}
      {(question.type === 'multiple-choice' || question.type === 'reading') && (
        <MultipleChoiceQuestion
          question={question}
          onSelect={handleMultipleChoiceSelect}
          selectedIndex={selectedOptionIndex}
          disabled={disabled}
          showResult={showResult}
        />
      )}

      {question.type === 'fill-blank' && (
        <FillInBlankQuestion
          question={question}
          onSubmit={handleFillBlankSubmit}
          disabled={disabled}
          showResult={showResult}
          submittedAnswer={submittedTextAnswer}
        />
      )}
    </div>
  );
}
