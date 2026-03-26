'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { EXAM_SUBJECTS } from '@/data/exams/subjects';
import { getExamsBySubject } from '@/data/exams';
import { useExamStore } from '@/stores/useExamStore';
import { ExamSubject } from '@/types/exam';
import StarRating from '@/components/ui/StarRating';

export default function SubjectExamsClient({ subject }: { subject: ExamSubject }) {
  const router = useRouter();

  const subjectInfo = EXAM_SUBJECTS.find((s) => s.slug === subject);
  const exams = getExamsBySubject(subject);
  const completedExams = useExamStore((s) => s.completedExams);

  if (!subjectInfo) {
    return <div className="text-white text-center">Không tìm thấy môn học</div>;
  }

  const getBestResult = (examId: string) => {
    const results = completedExams.filter((r) => r.examId === examId);
    if (results.length === 0) return null;
    return results.reduce((best, r) => (r.score > best.score ? r : best));
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/practice/exams')}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ←
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-white">{subjectInfo.icon} {subjectInfo.name}</h1>
          <p className="text-sm text-white/70">Lớp 2 HK2 - Chân trời sáng tạo</p>
        </div>
      </div>

      {exams.map((exam, i) => {
        const best = getBestResult(exam.id);

        return (
          <motion.div
            key={exam.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-sm text-gray-500">{exam.description}</p>
                </div>
                {best && <StarRating stars={best.starsEarned} size="sm" />}
              </div>

              <div className="flex gap-2 text-xs text-gray-400">
                <span>📝 {exam.totalQuestions} câu</span>
                <span>•</span>
                <span>⏱️ {exam.timeMinutes} phút</span>
                {best && (
                  <>
                    <span>•</span>
                    <span className="text-green-500 font-bold">Cao nhất: {best.score}/{exam.totalPoints}</span>
                  </>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/practice/exams/${subject}/${exam.id}`)}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm"
              >
                Mở đề thi →
              </motion.button>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
