'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useUserStore } from '@/stores/useUserStore';
import type { SavedSession } from '@/types';

type Filter = 'all' | 'practice' | 'games';

const TYPE_CONFIG: Record<SavedSession['type'], { label: string; icon: string; category: 'practice' | 'games' }> = {
  multiplication: { label: 'Bảng cửu chương', icon: '✖️', category: 'practice' },
  mixed: { label: 'Nhân hỗn hợp', icon: '🔀', category: 'practice' },
  'mental-math': { label: 'Tính nhẩm', icon: '🧠', category: 'practice' },
  racing: { label: 'Đua xe', icon: '🏎️', category: 'games' },
  shooting: { label: 'Bắn tàu', icon: '🚀', category: 'games' },
  puzzle: { label: 'Xếp hình', icon: '🧩', category: 'games' },
  'road-fighter': { label: 'Đua xe ăn xăng', icon: '⛽', category: 'games' },
};

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m${secs}s`;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const user = useUserStore((s) => s.user);
  const sessions = useHistoryStore((s) => s.sessions);

  const userSessions = sessions
    .filter((s) => s.userId === user?.uid)
    .filter((s) => {
      if (filter === 'all') return true;
      const config = TYPE_CONFIG[s.type];
      return config.category === filter;
    });

  // Summary stats
  const totalSessions = userSessions.length;
  const totalStars = userSessions.reduce((sum, s) => sum + s.starsEarned, 0);
  const avgAccuracy = totalSessions > 0
    ? Math.round(userSessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions * 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Lịch Sử Học Tập 📚</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Phiên học', value: totalSessions, icon: '📊' },
          { label: 'Tổng sao', value: totalStars, icon: '⭐' },
          { label: 'Chính xác', value: `${avgAccuracy}%`, icon: '🎯' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="text-center" padding="sm">
              <div className="text-xl mb-0.5">{item.icon}</div>
              <div className="text-xl font-black text-gray-800">{item.value}</div>
              <div className="text-[10px] text-gray-500">{item.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: 'all', label: 'Tất cả' },
          { key: 'practice', label: 'Học tập' },
          { key: 'games', label: 'Trò chơi' },
        ] as const).map((f) => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 px-3 rounded-2xl font-bold text-sm transition-all ${
              filter === f.key
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Sessions list */}
      {userSessions.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-500">Chưa có lịch sử</p>
          <p className="text-gray-400 text-sm mt-1">Bắt đầu học hoặc chơi game để ghi lại!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {userSessions.map((session, index) => {
            const config = TYPE_CONFIG[session.type];
            const accuracyPercent = Math.round(session.accuracy * 100);

            return (
              <motion.div
                key={session.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="text-2xl w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {config.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{config.label}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(session.startedAt)} · {formatDuration(session.durationMs)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-sm font-black text-gray-700">{session.score}</span>
                        <span className="text-xs text-gray-400">pts</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <span className={`text-xs font-bold ${
                          accuracyPercent >= 90 ? 'text-green-600' :
                          accuracyPercent >= 70 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {accuracyPercent}%
                        </span>
                        <span className="text-xs">
                          {'⭐'.repeat(session.starsEarned)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
