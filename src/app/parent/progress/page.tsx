'use client';

import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUserStore } from '@/stores/useUserStore';

export default function ProgressPage() {
  const user = useUserStore((s) => s.user);

  // Sample progress data
  const tableProgress = [2, 3, 4, 5, 6, 7, 8, 9].map((table) => ({
    table,
    accuracy: Math.floor(Math.random() * 40 + 60),
    attempts: Math.floor(Math.random() * 100 + 10),
    avgTime: (Math.random() * 3 + 2).toFixed(1),
    mastery: Math.random() > 0.6 ? 'mastered' as const : Math.random() > 0.3 ? 'practicing' as const : 'learning' as const,
  }));

  const masteryColors = {
    mastered: 'text-green-600 bg-green-100',
    practicing: 'text-yellow-600 bg-yellow-100',
    learning: 'text-red-600 bg-red-100',
  };

  const masteryLabels = {
    mastered: 'Thuộc',
    practicing: 'Đang học',
    learning: 'Đang ôn',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tiến Trình Chi Tiết</h1>

      {/* Overall accuracy */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Tổng quan</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-black text-blue-600">{user?.stats.totalProblems || 0}</p>
            <p className="text-sm text-gray-500">Tổng bài giải</p>
          </div>
          <div>
            <p className="text-3xl font-black text-green-600">{user?.stats.totalCorrect || 0}</p>
            <p className="text-sm text-gray-500">Trả lời đúng</p>
          </div>
          <div>
            <p className="text-3xl font-black text-purple-600">
              {user?.stats.totalProblems ? Math.round((user.stats.totalCorrect / user.stats.totalProblems) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">Chính xác</p>
          </div>
        </div>
      </Card>

      {/* Per-table progress */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-700">Chi tiết từng bảng</h2>
        {tableProgress.map((tp) => (
          <Card key={tp.table}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  {tp.table}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Bảng {tp.table}</h3>
                  <p className="text-xs text-gray-500">{tp.attempts} lần thử · TB {tp.avgTime}s/câu</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${masteryColors[tp.mastery]}`}>
                {masteryLabels[tp.mastery]}
              </span>
            </div>
            <ProgressBar value={tp.accuracy} max={100} color={tp.mastery === 'mastered' ? 'green' : tp.mastery === 'practicing' ? 'orange' : 'blue'} showLabel height="sm" />
          </Card>
        ))}
      </div>
    </div>
  );
}
