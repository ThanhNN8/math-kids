'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { getExamById } from '@/data/exams';
import { useExamStore } from '@/stores/useExamStore';
import { ExamSubject, ExamAnswer, ExamResult } from '@/types/exam';
import ExamQuestionRenderer from '@/components/exam/ExamQuestionRenderer';
import ExamProgress from '@/components/exam/ExamProgress';
import ExamResultSummary from '@/components/exam/ExamResultSummary';
import ExamReviewMode from '@/components/exam/ExamReviewMode';

type Mode = 'select' | 'take' | 'review' | 'result';

export default function ExamDetailClient({ subject, examId, initialMode = 'select' }: { subject: ExamSubject; examId: string; initialMode?: Mode }) {
  const router = useRouter();

  const exam = getExamById(subject, examId);

  const {
    startExam,
    answerQuestion,
    nextQuestion,
    completeExam,
    currentQuestionIndex,
    answers,
    reset,
  } = useExamStore();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [answered, setAnswered] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<ExamAnswer | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  if (!exam) {
    return <div className="text-white text-center">Không tìm thấy đề thi</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  const handleStartExam = () => {
    startExam(exam.id, subject);
    setMode('take');
    setAnswered(false);
    setCurrentAnswer(null);
  };

  const handleAnswer = useCallback((answer: { selectedOptionIndex?: number; textAnswer?: string; isCorrect: boolean }) => {
    if (answered) return;
    setAnswered(true);

    const examAnswer: ExamAnswer = {
      questionId: currentQuestion.id,
      selectedOptionIndex: answer.selectedOptionIndex,
      textAnswer: answer.textAnswer,
      isCorrect: answer.isCorrect,
      pointsEarned: answer.isCorrect ? (currentQuestion.points || 1) : 0,
    };

    setCurrentAnswer(examAnswer);
    answerQuestion(examAnswer);
  }, [answered, currentQuestion, answerQuestion]);

  const handleNext = () => {
    if (currentQuestionIndex + 1 >= exam.questions.length) {
      const result = completeExam(exam.totalPoints, exam.totalQuestions);
      setExamResult(result);
      setMode('result');
    } else {
      nextQuestion();
      setAnswered(false);
      setCurrentAnswer(null);
    }
  };

  const handleBackToList = () => {
    reset();
    router.push(`/practice/exams/${subject}`);
  };

  // Select mode
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
            <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
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
        </Card>
      </div>
    );
  }

  // Review mode
  if (mode === 'review') {
    return (
      <div className="max-w-lg mx-auto">
        <ExamReviewMode
          exam={exam}
          answers={examResult?.answers}
          onBack={() => examResult ? setMode('result') : handleBackToList()}
        />
      </div>
    );
  }

  // Result mode
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
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            reset();
            handleBackToList();
          }}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ✕
        </motion.button>
        <div className="flex-1">
          <ExamProgress current={currentQuestionIndex} total={exam.totalQuestions} />
        </div>
      </div>

      <Card className="space-y-4">
        <ExamQuestionRenderer
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={answered}
          showResult={answered}
          selectedOptionIndex={currentAnswer?.selectedOptionIndex}
          submittedTextAnswer={currentAnswer?.textAnswer}
        />

        {/* Explanation after answering */}
        {answered && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`p-4 rounded-xl text-sm ${currentAnswer?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div className={`font-bold mb-1 ${currentAnswer?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {currentAnswer?.isCorrect ? '🎉 Đúng rồi!' : '😢 Sai rồi!'}
            </div>
            <div className="text-gray-700">💡 {currentQuestion.explanation}</div>
          </motion.div>
        )}

        {/* Next button */}
        {answered && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg"
          >
            {currentQuestionIndex + 1 >= exam.totalQuestions ? '📊 Xem kết quả' : 'Câu tiếp →'}
          </motion.button>
        )}
      </Card>
    </div>
  );
}
