'use client';

import { motion } from 'framer-motion';
import { Exam } from '@/types/exam';
import { ExamAnswer } from '@/types/exam';

interface ExamReviewModeProps {
  exam: Exam;
  answers?: ExamAnswer[];
  onBack: () => void;
}

export default function ExamReviewMode({ exam, answers, onBack }: ExamReviewModeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ←
        </motion.button>
        <h2 className="text-xl font-bold text-white">{exam.title} - Đáp án & Lời giải</h2>
      </div>

      {exam.questions.map((question, index) => {
        const answer = answers?.find((a) => a.questionId === question.id);
        const isCorrect = answer?.isCorrect;

        return (
          <motion.div
            key={question.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-lg space-y-3"
          >
            {/* Question header */}
            <div className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                answer ? (isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'
              }`}>
                {index + 1}
              </span>
              <div className="flex-1">
                {/* Passage */}
                {question.passage && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm leading-relaxed text-gray-700 mb-3">
                    <div className="text-xs font-bold text-yellow-600 mb-1">📖 Bài đọc:</div>
                    <div className="whitespace-pre-line">{question.passage}</div>
                  </div>
                )}

                <p className="font-bold text-gray-800">{question.questionText}</p>
              </div>
            </div>

            {/* Options */}
            {question.options && (
              <div className="space-y-2 ml-11">
                {question.options.map((option, optIdx) => {
                  let optionClass = 'bg-gray-50 border border-gray-200 text-gray-600';
                  if (optIdx === question.correctOptionIndex) {
                    optionClass = 'bg-green-100 border border-green-400 text-green-800 font-semibold';
                  } else if (answer?.selectedOptionIndex === optIdx && !isCorrect) {
                    optionClass = 'bg-red-100 border border-red-400 text-red-700 line-through';
                  }

                  return (
                    <div key={optIdx} className={`p-3 rounded-xl text-sm ${optionClass}`}>
                      <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                      {option}
                      {optIdx === question.correctOptionIndex && ' ✓'}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fill-blank answer */}
            {question.type === 'fill-blank' && (
              <div className="ml-11 space-y-1">
                <div className="p-3 rounded-xl text-sm bg-green-100 border border-green-400 text-green-800 font-semibold">
                  Đáp án: {question.correctAnswer}
                </div>
                {answer?.textAnswer && !isCorrect && (
                  <div className="p-3 rounded-xl text-sm bg-red-100 border border-red-400 text-red-700">
                    Em trả lời: {answer.textAnswer}
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            <div className="ml-11 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
              <span className="font-bold">💡 Giải thích:</span> {question.explanation}
            </div>
          </motion.div>
        );
      })}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-lg"
      >
        ← Quay lại
      </motion.button>
    </div>
  );
}
