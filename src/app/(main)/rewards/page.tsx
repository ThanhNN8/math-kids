'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';
import { SHOP_CATALOG } from '@/data/shop';
import type { ShopItemDef } from '@/types';

const RARITY_STYLES: Record<ShopItemDef['rarity'], string> = {
  common: 'border-gray-200',
  rare: 'border-blue-300',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const RARITY_LABEL: Record<ShopItemDef['rarity'], string> = {
  common: 'Thường',
  rare: 'Hiếm',
  epic: 'Siêu hiếm',
  legendary: 'Huyền thoại',
};

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
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const user = useUserStore((s) => s.user);
  const purchaseItem = useUserStore((s) => s.purchaseItem);
  const totalStars = user?.stats.totalStars ?? 0;

  const ownedIds = useMemo(
    () => new Set((user?.ownedItems ?? []).map((i) => i.itemId)),
    [user?.ownedItems]
  );

  const handleBuy = (item: ShopItemDef) => {
    const result = purchaseItem(item.id);
    if (result.success) {
      setToast({ kind: 'success', message: `Đã mua ${item.name}! 🎉` });
    } else {
      const msg =
        result.reason === 'already-owned' ? 'Bé đã có món này rồi' :
        result.reason === 'insufficient-stars' ? 'Không đủ sao rồi!' :
        'Không mua được, thử lại nhé';
      setToast({ kind: 'error', message: msg });
    }
    setTimeout(() => setToast(null), 2000);
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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center font-bold rounded-2xl py-2 px-4 ${
              toast.kind === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'shop' ? (
        <div className="grid grid-cols-2 gap-3">
          {SHOP_CATALOG.map((item, i) => {
            const owned = ownedIds.has(item.id);
            const canAfford = totalStars >= item.cost;
            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`text-center border-2 ${RARITY_STYLES[item.rarity]}`}>
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">
                    {RARITY_LABEL[item.rarity]}
                  </div>
                  <div className="flex items-center justify-center gap-1 my-2">
                    <span>⭐</span>
                    <span className="font-bold text-yellow-600">{item.cost}</span>
                  </div>
                  {owned ? (
                    <Button variant="ghost" size="sm" fullWidth disabled>
                      ✓ Đã có
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      variant={canAfford ? 'primary' : 'ghost'}
                      size="sm"
                      fullWidth
                    >
                      {canAfford ? 'Mua' : 'Thiếu sao'}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
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
