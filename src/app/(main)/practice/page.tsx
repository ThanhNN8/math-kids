'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const modes = [
  {
    title: 'Bảng Cửu Chương',
    description: 'Luyện tập từng bảng nhân từ 2 đến 9',
    icon: '✖️',
    href: '/practice/multiplication',
    color: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Nhân Hỗn Hợp',
    description: 'Trộn nhiều bảng nhân để ghi nhớ tốt hơn',
    icon: '🔀',
    href: '/practice/mixed',
    color: 'from-pink-400 to-pink-600',
  },
  {
    title: 'Tính Nhẩm Nhanh',
    description: 'Cộng, trừ, nhân - đua tốc độ!',
    icon: '🧠',
    href: '/practice/mental-math',
    color: 'from-green-400 to-green-600',
  },
];

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-black text-white text-center mb-6">Học Tập 📖</h1>
      {modes.map((mode, i) => (
        <motion.div
          key={mode.href}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          <Card onClick={() => router.push(mode.href)} className="flex items-center gap-4 hover:shadow-xl">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-3xl shrink-0`}>
              {mode.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{mode.title}</h2>
              <p className="text-sm text-gray-500">{mode.description}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
