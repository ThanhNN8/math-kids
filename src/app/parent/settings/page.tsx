'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/stores/useUserStore';

export default function SettingsPage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [timeLimit, setTimeLimit] = useState(user?.settings.dailyTimeLimit || 30);
  const [enabledTables, setEnabledTables] = useState<number[]>(user?.settings.enabledTables || [2, 3, 4, 5, 6, 7, 8, 9]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'auto'>(user?.settings.difficultyLevel || 'auto');
  const [saved, setSaved] = useState(false);

  const toggleTable = (table: number) => {
    setEnabledTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table].sort()
    );
  };

  const handleSave = () => {
    if (!user) return;
    setUser({
      ...user,
      settings: {
        ...user.settings,
        dailyTimeLimit: timeLimit,
        enabledTables,
        difficultyLevel: difficulty as 'easy' | 'medium' | 'hard' | 'auto',
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cài Đặt</h1>

      {/* Time limit */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Giới hạn thời gian/ngày</h2>
        <div className="flex gap-3">
          {[15, 30, 45, 60].map((t) => (
            <button
              key={t}
              onClick={() => setTimeLimit(t)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                timeLimit === t ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t} phút
            </button>
          ))}
        </div>
      </Card>

      {/* Enabled tables */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Bảng cửu chương</h2>
        <p className="text-sm text-gray-500 mb-3">Chọn bảng bé cần luyện:</p>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((table) => (
            <button
              key={table}
              onClick={() => toggleTable(table)}
              className={`py-3 rounded-xl font-bold text-lg transition-all ${
                enabledTables.includes(table)
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {table}
            </button>
          ))}
        </div>
      </Card>

      {/* Difficulty */}
      <Card>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Độ khó</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'auto' as const, label: 'Tự động', desc: 'Điều chỉnh theo bé' },
            { value: 'easy' as const, label: 'Dễ', desc: 'Bảng 1-5' },
            { value: 'medium' as const, label: 'Vừa', desc: 'Bảng 2-9' },
            { value: 'hard' as const, label: 'Khó', desc: 'Bảng 2-10' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className={`p-3 rounded-xl text-left transition-all ${
                difficulty === opt.value ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-100'
              }`}
            >
              <div className={`font-bold ${difficulty === opt.value ? 'text-white' : 'text-gray-800'}`}>{opt.label}</div>
              <div className={`text-xs ${difficulty === opt.value ? 'text-purple-200' : 'text-gray-500'}`}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} variant="success" fullWidth size="lg">
        {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
      </Button>
    </div>
  );
}
