'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUserStore } from '@/stores/useUserStore';
import { xpForLevel } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const stats = user?.stats;

  const currentLevelXP = stats ? xpForLevel(stats.level) : 100;
  const xpProgress = stats ? stats.xp % currentLevelXP : 0;
  const accuracy = stats && stats.totalProblems > 0
    ? Math.round((stats.totalCorrect / stats.totalProblems) * 100)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Hồ Sơ 👤</h1>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="text-center">
          <Avatar avatarId={user?.avatarId || 1} size="xl" className="mx-auto mb-3" />
          <h2 className="text-2xl font-black text-gray-800">{user?.displayName || 'Bé'}</h2>
          <p className="text-gray-500">Level {stats?.level || 1}</p>
          <div className="mt-3">
            <ProgressBar value={xpProgress} max={currentLevelXP} color="purple" showLabel height="md" />
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tổng sao', value: stats?.totalStars || 0, icon: '⭐' },
          { label: 'Chuỗi ngày', value: stats?.currentStreak || 0, icon: '🔥' },
          { label: 'Bài giải', value: stats?.totalProblems || 0, icon: '📝' },
          { label: 'Chính xác', value: `${accuracy}%`, icon: '🎯' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-2xl font-black text-gray-800">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <h3 className="font-bold text-gray-700 mb-3">Cài đặt</h3>
        <div className="space-y-2">
          <Button onClick={() => router.push('/parent')} variant="ghost" fullWidth>
            👨‍👩‍👧 Khu vực phụ huynh
          </Button>
          <Button onClick={handleLogout} variant="danger" fullWidth>
            Đăng xuất
          </Button>
        </div>
      </Card>
    </div>
  );
}
