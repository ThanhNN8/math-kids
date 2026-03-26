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
import { useAuthStore } from '@/stores/useAuthStore';
import { xpForLevel } from '@/types';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { registerWithEmail } from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);
  const updatePassword = useAccountsStore((s) => s.updatePassword);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const stats = user?.stats;

  const isFirebaseUser = user?.authProvider === 'firebase';

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Link email state
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');

  const currentLevelXP = stats ? xpForLevel(stats.level) : 100;
  const xpProgress = stats ? stats.xp % currentLevelXP : 0;
  const accuracy = stats && stats.totalProblems > 0
    ? Math.round((stats.totalCorrect / stats.totalProblems) * 100)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = async () => {
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

    if (isFirebaseUser) {
      // Firebase password change
      if (newPwd.length < 6) {
        setPwdError('Mật khẩu Firebase phải ít nhất 6 ký tự');
        return;
      }
      try {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
          setPwdError('Không tìm thấy phiên đăng nhập');
          return;
        }
        const credential = EmailAuthProvider.credential(currentUser.email, oldPwd);
        await reauthenticateWithCredential(currentUser, credential);
        await firebaseUpdatePassword(currentUser, newPwd);
        setPwdSuccess('Đổi mật khẩu thành công!');
        setOldPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setTimeout(() => {
          setShowPasswordForm(false);
          setPwdSuccess('');
        }, 1500);
      } catch {
        setPwdError('Sai mật khẩu cũ hoặc phiên hết hạn');
      }
    } else {
      // Local password change
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
    }
  };

  const handleLinkEmail = async () => {
    if (!linkEmail.trim() || !linkPassword) return;
    if (linkPassword.length < 6) {
      setLinkError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    if (!user) return;

    setLinkLoading(true);
    setLinkError('');

    try {
      const firebaseUser = await registerWithEmail(linkEmail.trim(), linkPassword);
      setFirebaseUser(firebaseUser.uid, firebaseUser.email || linkEmail.trim());

      // Create Firestore profile
      await createUserProfile(firebaseUser.uid, {
        displayName: user.displayName,
        avatarId: user.avatarId,
        email: linkEmail.trim(),
        authProvider: 'firebase',
        settings: user.settings,
        stats: user.stats,
      });

      // Update local user
      setUser({
        ...user,
        uid: firebaseUser.uid,
        email: linkEmail.trim(),
        authProvider: 'firebase',
      });

      setLinkSuccess('Liên kết thành công! Dữ liệu đã được đồng bộ.');
      setTimeout(() => {
        setShowLinkForm(false);
        setLinkSuccess('');
      }, 2000);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/email-already-in-use') {
        setLinkError('Email này đã được sử dụng');
      } else if (firebaseErr.code === 'auth/invalid-email') {
        setLinkError('Email không hợp lệ');
      } else {
        setLinkError('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Hồ Sơ 👤</h1>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="text-center">
          <Avatar avatarId={user?.avatarId || 1} size="xl" className="mx-auto mb-3" />
          <h2 className="text-2xl font-black text-gray-800">{user?.displayName || 'Bé'}</h2>
          {isFirebaseUser && user?.email && (
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          )}
          <p className="text-gray-500">Level {stats?.level || 1}</p>
          {isFirebaseUser && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              Đồng bộ đám mây
            </span>
          )}
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
              inputMode={isFirebaseUser ? undefined : 'numeric'}
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              placeholder="Mật khẩu cũ"
              className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              inputMode={isFirebaseUser ? undefined : 'numeric'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              inputMode={isFirebaseUser ? undefined : 'numeric'}
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

      {/* Link email for local users */}
      {!isFirebaseUser && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700">Liên kết Email</h3>
            <Button
              onClick={() => { setShowLinkForm(!showLinkForm); setLinkError(''); setLinkSuccess(''); }}
              variant="ghost"
              size="sm"
            >
              {showLinkForm ? 'Đóng' : 'Liên kết'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Liên kết email để đồng bộ dữ liệu lên đám mây và sử dụng trên nhiều thiết bị.
          </p>
          {showLinkForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3">
              <input
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="Email"
                className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
              />
              <input
                type="password"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 text-gray-800 focus:outline-none focus:border-blue-400"
              />
              {linkError && <p className="text-red-500 text-sm font-bold">{linkError}</p>}
              {linkSuccess && <p className="text-green-500 text-sm font-bold">{linkSuccess}</p>}
              <Button onClick={handleLinkEmail} variant="primary" fullWidth disabled={linkLoading}>
                {linkLoading ? 'Đang liên kết...' : 'Liên kết Email'}
              </Button>
            </motion.div>
          )}
        </Card>
      )}

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
