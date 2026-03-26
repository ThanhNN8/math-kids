'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { EXAM_SUBJECTS } from '@/data/exams/subjects';

const colorMap: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  purple: 'from-purple-400 to-purple-600',
};

export default function ExamsHubPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/practice')}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg"
        >
          ←
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-white">Đề thi</h1>
          <p className="text-sm text-white/70">Lớp 2 HK2 - Chân trời sáng tạo</p>
        </div>
      </div>

      {EXAM_SUBJECTS.map((subject, i) => (
        <motion.div
          key={subject.slug}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          <Card
            onClick={() => router.push(`/practice/exams/${subject.slug}`)}
            className="flex items-center gap-4 hover:shadow-xl"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[subject.color]} flex items-center justify-center text-3xl shrink-0`}>
              {subject.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{subject.name}</h2>
              <p className="text-sm text-gray-500">{subject.examCount} đề thi</p>
            </div>
            <div className="text-gray-400 text-xl">›</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
