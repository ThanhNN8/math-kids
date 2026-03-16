'use client';

import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUserStore } from '@/stores/useUserStore';

export default function ParentDashboardPage() {
  const user = useUserStore((s) => s.user);
  const stats = user?.stats;

  const accuracy = stats && stats.totalProblems > 0
    ? Math.round((stats.totalCorrect / stats.totalProblems) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Tổng quan - {user?.displayName || 'Bé'}
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Level', value: stats?.level || 1, icon: '📊', color: 'text-blue-600' },
          { label: 'Tổng sao', value: stats?.totalStars || 0, icon: '⭐', color: 'text-yellow-600' },
          { label: 'Bài giải', value: stats?.totalProblems || 0, icon: '📝', color: 'text-green-600' },
          { label: 'Chính xác', value: `${accuracy}%`, icon: '🎯', color: 'text-purple-600' },
        ].map((item) => (
          <Card key={item.label} className="text-center bg-white">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-500">{item.label}</div>
          </Card>
        ))}
      </div>

      {/* XP Progress */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Tiến trình XP</h2>
        <ProgressBar value={stats?.xp || 0} max={1000} color="purple" showLabel height="lg" />
      </Card>

      {/* Streak info */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Thói quen học tập</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Chuỗi hiện tại</p>
            <p className="text-2xl font-black text-orange-600">🔥 {stats?.currentStreak || 0} ngày</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Chuỗi dài nhất</p>
            <p className="text-2xl font-black text-purple-600">🏆 {stats?.longestStreak || 0} ngày</p>
          </div>
        </div>
      </Card>

      {/* Mastery Heatmap */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Bảng Cửu Chương</h2>
        <div className="grid grid-cols-8 gap-2">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((table) => {
            // Placeholder mastery level
            const mastery = Math.random();
            const color = mastery > 0.8 ? 'bg-green-400' : mastery > 0.5 ? 'bg-yellow-400' : 'bg-red-300';
            return (
              <div key={table} className="text-center">
                <div className={`w-full aspect-square rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg`}>
                  {table}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {mastery > 0.8 ? 'Thuộc' : mastery > 0.5 ? 'Đang học' : 'Cần ôn'}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block"></span> Thuộc</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block"></span> Đang học</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300 inline-block"></span> Cần ôn</span>
        </div>
      </Card>
    </div>
  );
}
