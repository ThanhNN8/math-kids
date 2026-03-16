'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { AVATARS } from '@/types';
import { useUserStore } from '@/stores/useUserStore';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [step, setStep] = useState<'avatar' | 'name'>('avatar');
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const handleStart = () => {
    const user = {
      uid: `local_${Date.now()}`,
      displayName: name || 'Bé',
      avatarId: selectedAvatar,
      role: 'child' as const,
      createdAt: Date.now(),
      settings: {
        dailyTimeLimit: 30,
        enabledTables: [2, 3, 4, 5, 6, 7, 8, 9],
        difficultyLevel: 'auto' as const,
        soundEnabled: true,
      },
      stats: {
        totalStars: 0,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalProblems: 0,
        totalCorrect: 0,
      },
    };
    setUser(user);
    router.push('/home');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg"
      >
        <motion.h1
          className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          MathKids 🧮
        </motion.h1>
        <p className="text-center text-gray-500 text-lg mb-6">Học Toán Thật Vui!</p>

        {step === 'avatar' ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Chọn nhân vật của con 👇
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATARS.map((avatar) => (
                <motion.div
                  key={avatar.id}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Avatar
                    avatarId={avatar.id}
                    size="lg"
                    selected={selectedAvatar === avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  />
                  <span className="text-xs text-gray-500 font-medium">{avatar.name}</span>
                </motion.div>
              ))}
            </div>
            <Button onClick={() => setStep('name')} fullWidth size="lg">
              Tiếp theo →
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <Avatar avatarId={selectedAvatar} size="xl" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Con tên gì? 😊
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên con..."
              maxLength={20}
              className="w-full text-2xl text-center font-bold border-3 border-blue-300 rounded-2xl py-4 px-4 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            <div className="flex gap-3">
              <Button onClick={() => setStep('avatar')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button onClick={handleStart} fullWidth size="lg" variant="success">
                Bắt đầu! 🚀
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
