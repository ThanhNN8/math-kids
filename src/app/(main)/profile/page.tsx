'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { useUserStore } from '@/stores/useUserStore';
import { useAccountsStore } from '@/stores/useAccountsStore';
import { xpForLevel } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const updatePassword = useAccountsStore((s) => s.updatePassword);
  const stats = user?.stats;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const currentLevelXP = stats ? xpForLevel(stats.level) : 100;
  const xpProgress = stats ? stats.xp % currentLevelXP : 0;
  const accuracy = stats && stats.totalProblems > 0
    ? Math.round((stats.totalCorrect / stats.totalProblems) * 100)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = () => {
    setPwdError('');
    setPwdSuccess('');

    if (!newPwd || newPwd.length < 4) {
      setPwdError('Mật khẩu mới phải ít nhất 4 ký tự');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('Xác nhận mật khẩu không khớp');
      return;
    }
    if (!user) return;

    const success = updatePassword(user.uid, oldPwd, newPwd);
    if (success) {
      setPwdSuccess('Đổi mật khẩu thành công!');
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPwdSuccess('');
      }, 1500);
    } else {
      setPwdError('Sai mật khẩu cũ');
    }
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

      {/* Change password */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">Đổi mật khẩu</h3>
          <Button
            onClick={() => { setShowPasswordForm(!showPasswordForm); setPwdError(''); setPwdSuccess(''); }}
            variant="ghost"
            size="sm"
          >
            {showPasswordForm ? 'Đóng' : 'Đổi'}
          </Button>
        </div>
        {showPasswordForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              placeholder="Mật khẩu cũ"
              className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              inputMode="numeric"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              inputMode="numeric"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
            />
            {pwdError && <p className="text-red-500 text-sm font-bold">{pwdError}</p>}
            {pwdSuccess && <p className="text-green-500 text-sm font-bold">{pwdSuccess}</p>}
            <Button onClick={handleChangePassword} variant="primary" fullWidth>
              Xác nhận đổi mật khẩu
            </Button>
          </motion.div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-gray-700 mb-3">Cài đặt</h3>
        <div className="space-y-2">
          <Button onClick={() => router.push('/history')} variant="ghost" fullWidth>
            📚 Lịch sử học tập
          </Button>
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
