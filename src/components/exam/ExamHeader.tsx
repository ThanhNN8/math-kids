'use client';

import type { Exam } from '@/types/exam';

export default function ExamHeader({ exam }: { exam: Exam }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center px-5 py-8 shadow-lg">
      <h1 className="text-2xl md:text-3xl font-black leading-tight">{exam.title}</h1>
      {exam.subtitle && (
        <div className="text-sm md:text-base opacity-90 mt-1">{exam.subtitle}</div>
      )}
      <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full mt-3 text-xs md:text-sm font-semibold">
        Thời gian: {exam.timeMinutes} phút • Tổng điểm: {exam.totalPoints}
      </div>
    </div>
  );
}
