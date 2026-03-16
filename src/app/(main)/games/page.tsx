'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const games = [
  {
    id: 'racing',
    title: 'Đua Xe 🏎️',
    description: 'Trả lời đúng để tăng tốc, về nhất!',
    color: 'from-red-400 to-red-600',
    href: '/games/racing',
  },
  {
    id: 'shooting',
    title: 'Bắn Tàu 🚀',
    description: 'Bắn hạ quái vật mang đáp án đúng!',
    color: 'from-purple-400 to-purple-600',
    href: '/games/shooting',
  },
  {
    id: 'puzzle',
    title: 'Xếp Hình 🧩',
    description: 'Giải toán để mở mảnh ghép!',
    color: 'from-orange-400 to-orange-600',
    href: '/games/puzzle',
  },
];

export default function GamesPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-black text-white text-center mb-6">Trò Chơi 🎮</h1>
      {games.map((game, i) => (
        <motion.div
          key={game.id}
          initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          <Card onClick={() => router.push(game.href)} className="overflow-hidden hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl shrink-0 shadow-lg`}>
                {game.id === 'racing' ? '🏎️' : game.id === 'shooting' ? '🚀' : '🧩'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{game.title}</h2>
                <p className="text-sm text-gray-500">{game.description}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
