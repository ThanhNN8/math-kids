'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';

interface ShopItemData {
  id: string;
  name: string;
  emoji: string;
  type: string;
  cost: number;
  owned: boolean;
}

const shopItems: ShopItemData[] = [
  { id: 'car1', name: 'Xe Đua Đỏ', emoji: '🏎️', type: 'car_skin', cost: 10, owned: false },
  { id: 'car2', name: 'Xe Đua Xanh', emoji: '🚙', type: 'car_skin', cost: 20, owned: false },
  { id: 'car3', name: 'Xe Siêu Tốc', emoji: '🏁', type: 'car_skin', cost: 50, owned: false },
  { id: 'ship1', name: 'Tàu Xanh', emoji: '🛸', type: 'ship_skin', cost: 15, owned: false },
  { id: 'ship2', name: 'Tàu Vàng', emoji: '✨', type: 'ship_skin', cost: 30, owned: false },
  { id: 'ship3', name: 'Tàu Rồng', emoji: '🐉', type: 'ship_skin', cost: 50, owned: false },
  { id: 'avatar1', name: 'Siêu Nhân', emoji: '🦸', type: 'avatar', cost: 5, owned: false },
  { id: 'avatar2', name: 'Công Chúa', emoji: '👸', type: 'avatar', cost: 10, owned: false },
  { id: 'avatar3', name: 'Ninja', emoji: '🥷', type: 'avatar', cost: 20, owned: false },
];

const badges = [
  { id: 'table2', name: 'Bảng 2 Master', emoji: '🥉', criteria: '95%+ bảng 2', earned: false },
  { id: 'table5', name: 'Bảng 5 Master', emoji: '🥈', criteria: '95%+ bảng 5', earned: false },
  { id: 'speed', name: 'Speed King', emoji: '⚡', criteria: 'TB <2s / 20 đề', earned: false },
  { id: 'perfect', name: 'Perfect Round', emoji: '💎', criteria: '100% / 20 đề', earned: false },
  { id: 'racer', name: 'Road Champion', emoji: '🏆', criteria: '10 lần nhất', earned: false },
  { id: 'streak7', name: '7-Day Streak', emoji: '🔥', criteria: '7 ngày liên tiếp', earned: false },
];

export default function RewardsPage() {
  const [tab, setTab] = useState<'shop' | 'badges'>('shop');
  const user = useUserStore((s) => s.user);
  const updateStars = useUserStore((s) => s.updateStars);
  const totalStars = user?.stats.totalStars || 0;

  const handleBuy = (item: ShopItemData) => {
    if (totalStars < item.cost) return;
    updateStars(-item.cost);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-black text-white text-center">Phần Thưởng 🏆</h1>

      <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-2 mx-auto w-fit">
        <span className="text-2xl">⭐</span>
        <span className="text-xl font-black text-white">{totalStars} sao</span>
      </div>

      <div className="flex gap-2 justify-center">
        {(['shop', 'badges'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              tab === t ? 'bg-white text-purple-600 shadow-lg' : 'bg-white/20 text-white'
            }`}
          >
            {t === 'shop' ? '🛍️ Cửa hàng' : '🎖️ Huy hiệu'}
          </button>
        ))}
      </div>

      {tab === 'shop' ? (
        <div className="grid grid-cols-2 gap-3">
          {shopItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="text-center">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                <div className="flex items-center justify-center gap-1 my-2">
                  <span>⭐</span>
                  <span className="font-bold text-yellow-600">{item.cost}</span>
                </div>
                <Button
                  onClick={() => handleBuy(item)}
                  disabled={totalStars < item.cost}
                  variant={totalStars >= item.cost ? 'primary' : 'ghost'}
                  size="sm"
                  fullWidth
                >
                  {totalStars >= item.cost ? 'Mua' : 'Thiếu sao'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`flex items-center gap-4 ${badge.earned ? '' : 'opacity-60'}`}>
                <div className="text-4xl">{badge.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{badge.name}</h3>
                  <p className="text-sm text-gray-500">{badge.criteria}</p>
                </div>
                {badge.earned ? (
                  <span className="text-green-500 font-bold text-sm">Đạt ✓</span>
                ) : (
                  <span className="text-gray-400 text-sm">Chưa đạt</span>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
