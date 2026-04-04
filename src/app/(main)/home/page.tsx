'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUserStore } from '@/stores/useUserStore';
import { xpForLevel } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const stats = user?.stats;

  const currentLevelXP = stats ? xpForLevel(stats.level) : 100;
  const xpProgress = stats ? stats.xp % currentLevelXP : 0;

  const studyActions = [
    { title: 'Nghe đọc', desc: 'Nghe và nhẩm theo', icon: '🔊', href: '/practice/listen', color: 'bg-orange-500' },
    { title: 'Bảng cửu chương', desc: 'Luyện từng bảng', icon: '✖️', href: '/practice/multiplication', color: 'bg-blue-500' },
    { title: 'Nhân hỗn hợp', desc: 'Trộn nhiều bảng', icon: '🔀', href: '/practice/mixed', color: 'bg-pink-500' },
    { title: 'Tính nhẩm', desc: 'Nhanh tay nhanh mắt', icon: '🧠', href: '/practice/mental-math', color: 'bg-green-500' },
    { title: 'Mẹo nhanh', desc: 'Tròn chục, đổi chỗ', icon: '⚡', href: '/practice/tips', color: 'bg-yellow-500' },
    { title: 'Đề thi', desc: 'Toán, Việt, Anh', icon: '📋', href: '/practice/exams', color: 'bg-rose-500' },
  ];

  const gameActions = [
    { title: 'Đua xe', desc: 'Vượt đối thủ', icon: '🏎️', href: '/games/racing', color: 'bg-red-500' },
    { title: 'Bắn tàu', desc: 'Tiêu diệt quái', icon: '🚀', href: '/games/shooting', color: 'bg-purple-500' },
    { title: 'Xếp hình', desc: 'Ghép ảnh đẹp', icon: '🧩', href: '/games/puzzle', color: 'bg-orange-500' },
    { title: 'Ăn xăng', desc: 'Né xe, ăn xăng', icon: '⛽', href: '/games/road-fighter', color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Welcome */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
          <h1 className="text-2xl font-black mb-1">
            Chào {user?.displayName || 'Bé'}! 👋
          </h1>
          <p className="text-white/80 text-sm mb-3">Hôm nay mình học toán nhé!</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-white/80 mb-1">
                <span>Level {stats?.level || 1}</span>
                <span>{xpProgress}/{currentLevelXP} XP</span>
              </div>
              <ProgressBar value={xpProgress} max={currentLevelXP} color="orange" height="sm" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bài giải', value: stats?.totalProblems || 0, icon: '📝' },
          { label: 'Đúng', value: stats?.totalCorrect || 0, icon: '✅' },
          { label: 'Chuỗi', value: stats?.currentStreak || 0, icon: '🔥' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Học tập */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">📖 Học tập</h2>
        <div className="grid grid-cols-3 gap-3">
          {studyActions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card onClick={() => router.push(action.href)} className="hover:shadow-xl text-center">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mb-2 mx-auto`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{action.title}</h3>
                <p className="text-[10px] text-gray-500">{action.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trò chơi */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">🎮 Trò chơi</h2>
        <div className="grid grid-cols-3 gap-3">
          {gameActions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
            >
              <Card onClick={() => router.push(action.href)} className="hover:shadow-xl text-center">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mb-2 mx-auto`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{action.title}</h3>
                <p className="text-[10px] text-gray-500">{action.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
