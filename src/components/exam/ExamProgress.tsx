'use client';

import ProgressBar from '@/components/ui/ProgressBar';

interface ExamProgressProps {
  current: number;
  total: number;
}

export default function ExamProgress({ current, total }: ExamProgressProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Câu {current + 1}/{total}</span>
        <span>{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      <ProgressBar value={current + 1} max={total} color="blue" height="sm" />
    </div>
  );
}
