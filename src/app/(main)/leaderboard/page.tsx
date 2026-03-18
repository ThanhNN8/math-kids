'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useAccountsStore } from '@/stores/useAccountsStore';
import { useUserStore } from '@/stores/useUserStore';

type Tab = 'stars' | 'score' | 'problems';

const TAB_CONFIG: Record<Tab, { label: string; icon: string }> = {
  stars: { label: 'Tổng sao', icon: '⭐' },
  score: { label: 'Điểm XP', icon: '💎' },
  problems: { label: 'Bài giải', icon: '📝' },
};

const RANK_STYLES = [
  'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400',
  'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400',
  'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400',
];

const RANK_ICONS = ['👑', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('stars');
  const accounts = useAccountsStore((s) => s.accounts);
  const currentUser = useUserStore((s) => s.user);

  const sorted = [...accounts].sort((a, b) => {
    if (tab === 'stars') return b.stats.totalStars - a.stats.totalStars;
    if (tab === 'score') return b.stats.xp - a.stats.xp;
    return b.stats.totalProblems - a.stats.totalProblems;
  });

  const getValue = (stats: typeof accounts[0]['stats']) => {
    if (tab === 'stars') return stats.totalStars;
    if (tab === 'score') return stats.xp;
    return stats.totalProblems;
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Bảng Xếp Hạng 🏆</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-2xl font-bold text-sm transition-all ${
              tab === t
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            {TAB_CONFIG[t].icon} {TAB_CONFIG[t].label}
          </motion.button>
        ))}
      </div>

      {accounts.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500">Chưa có tài khoản nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((account, index) => {
            const isCurrentUser = currentUser?.uid === account.uid;
            const isTop3 = index < 3;

            return (
              <motion.div
                key={account.uid}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`flex items-center gap-3 ${
                    isTop3
                      ? `border-2 ${RANK_STYLES[index]}`
                      : isCurrentUser
                      ? 'border-2 border-blue-400 bg-blue-50'
                      : ''
                  }`}
                  padding="sm"
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {isTop3 ? (
                      <span className="text-2xl">{RANK_ICONS[index]}</span>
                    ) : (
                      <span className="text-lg font-black text-gray-400">{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar avatarId={account.avatarId} size="sm" />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                      {account.displayName}
                      {isCurrentUser && <span className="text-xs ml-1">(Bạn)</span>}
                    </p>
                    <p className="text-xs text-gray-400">Lv.{account.stats.level}</p>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <div className={`text-xl font-black ${isTop3 ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {getValue(account.stats).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">{TAB_CONFIG[tab].icon}</div>
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
