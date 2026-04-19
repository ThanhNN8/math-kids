'use client';

import { motion } from 'framer-motion';
import StarRating from '@/components/ui/StarRating';
import { ExamResult } from '@/types/exam';
import ExamVideoSolution from './ExamVideoSolution';

interface ExamResultSummaryProps {
  result: ExamResult;
  videoSolutionId?: string;
  onReview: () => void;
  onBack: () => void;
}

export default function ExamResultSummary({ result, videoSolutionId, onReview, onBack }: ExamResultSummaryProps) {
  const accuracyPercent = Math.round(result.accuracy * 100);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="space-y-6 text-center"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Kết quả</h2>
        <StarRating stars={result.starsEarned} size="lg" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-blue-500">{result.score}</div>
          <div className="text-xs text-gray-500 mt-1">Điểm</div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-green-500">{accuracyPercent}%</div>
          <div className="text-xs text-gray-500 mt-1">Chính xác</div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-purple-500">
            {result.correctCount}/{result.totalQuestions}
          </div>
          <div className="text-xs text-gray-500 mt-1">Đúng</div>
        </motion.div>
      </div>

      {videoSolutionId && (
        <ExamVideoSolution videoId={videoSolutionId} />
      )}

      <div className="space-y-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onReview}
          className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-lg"
        >
          📝 Xem lại lời giải
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full py-4 bg-white/20 text-white rounded-2xl font-bold text-lg"
        >
          ← Quay lại
        </motion.button>
      </div>
    </motion.div>
  );
}
