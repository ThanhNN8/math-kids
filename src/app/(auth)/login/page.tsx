'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { AVATARS } from '@/types';
import type { AccountRecord } from '@/types';
import { useUserStore } from '@/stores/useUserStore';
import { useAccountsStore } from '@/stores/useAccountsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { DEFAULT_PASSWORD } from '@/lib/passwordUtils';
import { loginWithEmail, registerWithEmail } from '@/lib/firebase/auth';
import { getUserProfile, createUserProfile } from '@/lib/firebase/firestore';

type Step =
  | 'select-account'
  | 'enter-password'
  | 'create-avatar'
  | 'create-name'
  | 'email-login'
  | 'create-email'
  | 'create-password';

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Sai mật khẩu';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (ít nhất 6 ký tự)';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử, vui lòng đợi một lát';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng';
    default:
      return 'Đã có lỗi xảy ra, vui lòng thử lại';
  }
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('select-account');
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [shake, setShake] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [isNewEmailAccount, setIsNewEmailAccount] = useState(false);
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const accounts = useAccountsStore((s) => s.accounts);
  const createAccount = useAccountsStore((s) => s.createAccount);
  const authenticate = useAccountsStore((s) => s.authenticate);
  const importLegacyAccount = useAccountsStore((s) => s.importLegacyAccount);
  const setLastLoggedInUid = useAccountsStore((s) => s.setLastLoggedInUid);
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);

  // Data migration: import legacy account on first visit
  useEffect(() => {
    if (accounts.length > 0) return;
    try {
      const raw = localStorage.getItem('math-kids-user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const legacyUser = parsed?.state?.user;
      if (legacyUser && legacyUser.uid && legacyUser.displayName) {
        importLegacyAccount(legacyUser);
      }
    } catch {
      // ignore parse errors
    }
  }, [accounts.length, importLegacyAccount]);

  // Auto-redirect to create if no accounts
  useEffect(() => {
    if (accounts.length === 0 && step === 'select-account') {
      setStep('create-avatar');
    }
  }, [accounts.length, step]);

  const loginWithAccount = (account: AccountRecord) => {
    setUser({
      uid: account.uid,
      displayName: account.displayName,
      avatarId: account.avatarId,
      role: account.role,
      createdAt: account.createdAt,
      settings: account.settings,
      stats: account.stats,
      email: account.email,
      authProvider: account.authProvider,
      ownedItems: account.ownedItems ?? [],
    });
    setLastLoggedInUid(account.uid);
    router.push('/home');
  };

  const handleSelectAccount = (account: AccountRecord) => {
    setSelectedAccount(account);
    setPassword('');
    setPasswordError('');
    setStep('enter-password');
  };

  const handlePasswordSubmit = () => {
    if (!selectedAccount) return;
    const result = authenticate(selectedAccount.displayName, password);
    if (result) {
      loginWithAccount(result);
    } else {
      setPasswordError('Sai mật khẩu rồi!');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleCreateAccount = () => {
    if (!name.trim()) return;
    const existing = useAccountsStore.getState().findByName(name.trim());
    if (existing) {
      setPasswordError('Tên này đã có rồi!');
      return;
    }
    if (isNewEmailAccount) {
      // Go to email step for cloud account creation
      setPasswordError('');
      setStep('create-email');
    } else {
      // Create local account directly
      const account = createAccount(name.trim(), selectedAvatar);
      loginWithAccount(account);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !emailPassword) return;
    setEmailLoading(true);
    setPasswordError('');

    try {
      const firebaseUser = await loginWithEmail(email.trim(), emailPassword);
      setFirebaseUser(firebaseUser.uid, firebaseUser.email || email.trim());

      // Fetch profile from Firestore
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUser({
          ...profile,
          ownedItems: profile.ownedItems ?? [],
          email: firebaseUser.email || profile.email,
          authProvider: 'firebase',
        });
        router.push('/home');
      } else {
        setPasswordError('Không tìm thấy hồ sơ. Vui lòng đăng ký mới.');
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setPasswordError(getFirebaseErrorMessage(firebaseErr.code || ''));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email.trim() || !emailPassword) return;
    if (emailPassword.length < 6) {
      setPasswordError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    setEmailLoading(true);
    setPasswordError('');

    try {
      const firebaseUser = await registerWithEmail(email.trim(), emailPassword);
      setFirebaseUser(firebaseUser.uid, firebaseUser.email || email.trim());

      // Create profile in Firestore
      await createUserProfile(firebaseUser.uid, {
        displayName: name.trim(),
        avatarId: selectedAvatar,
        email: email.trim(),
        authProvider: 'firebase',
      });

      // Set user locally
      setUser({
        uid: firebaseUser.uid,
        displayName: name.trim(),
        avatarId: selectedAvatar,
        role: 'child',
        createdAt: Date.now(),
        email: email.trim(),
        authProvider: 'firebase',
        settings: {
          dailyTimeLimit: 30,
          enabledTables: [2, 3, 4, 5, 6, 7, 8, 9],
          difficultyLevel: 'auto',
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
        ownedItems: [],
      });

      router.push('/home');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setPasswordError(getFirebaseErrorMessage(firebaseErr.code || ''));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setEmailLoading(false);
    }
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
          MathKids
        </motion.h1>
        <p className="text-center text-gray-500 text-lg mb-6">Học Toán Thật Vui!</p>

        {/* Step 1: Select account */}
        {step === 'select-account' && (
          <>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Chọn tài khoản
            </h2>
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {accounts.map((account) => (
                <motion.button
                  key={account.uid}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectAccount(account)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-300 transition-all text-left"
                >
                  <Avatar avatarId={account.avatarId} size="md" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{account.displayName}</p>
                    <p className="text-xs text-gray-400">
                      Lv.{account.stats.level} · {account.stats.totalStars} sao
                    </p>
                  </div>
                  <span className="text-gray-300 text-xl">›</span>
                </motion.button>
              ))}
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => { setStep('create-avatar'); setName(''); setSelectedAvatar(1); setPasswordError(''); setIsNewEmailAccount(false); }}
                fullWidth
                size="lg"
                variant="ghost"
              >
                + Tạo tài khoản mới
              </Button>
              <Button
                onClick={() => { setStep('email-login'); setEmail(''); setEmailPassword(''); setPasswordError(''); }}
                fullWidth
                size="lg"
                variant="ghost"
              >
                Đăng nhập bằng Email
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Enter password (local account) */}
        {step === 'enter-password' && selectedAccount && (
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col items-center mb-4">
              <Avatar avatarId={selectedAccount.avatarId} size="xl" />
              <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedAccount.displayName}</h2>
            </div>
            <input
              type="password"
              inputMode="numeric"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Nhập mật khẩu..."
              maxLength={20}
              className="w-full text-2xl text-center font-bold border-3 border-blue-300 rounded-2xl py-4 px-4 mb-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center mb-2 font-bold">{passwordError}</p>
            )}
            <p className="text-xs text-gray-400 text-center mb-4">
              Mật khẩu mặc định: {DEFAULT_PASSWORD}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setStep('select-account')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button onClick={handlePasswordSubmit} fullWidth size="lg" variant="primary">
                Đăng nhập
              </Button>
            </div>
          </motion.div>
        )}

        {/* Email Login */}
        {step === 'email-login' && (
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Đăng nhập bằng Email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setPasswordError(''); }}
              placeholder="Email..."
              className="w-full text-lg font-bold border-3 border-blue-300 rounded-2xl py-3 px-4 mb-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => { setEmailPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
              placeholder="Mật khẩu..."
              className="w-full text-lg font-bold border-3 border-blue-300 rounded-2xl py-3 px-4 mb-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center mb-2 font-bold">{passwordError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep('select-account')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button onClick={handleEmailLogin} fullWidth size="lg" variant="primary" disabled={emailLoading}>
                {emailLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3a: Create account — choose avatar */}
        {step === 'create-avatar' && (
          <>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Chọn nhân vật của con
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
            <div className="flex gap-3">
              {accounts.length > 0 && (
                <Button onClick={() => setStep('select-account')} variant="ghost" size="lg">
                  ← Quay lại
                </Button>
              )}
              <Button onClick={() => { setStep('create-name'); setPasswordError(''); }} fullWidth size="lg">
                Tiếp theo →
              </Button>
            </div>
          </>
        )}

        {/* Step 3b: Create account — enter name */}
        {step === 'create-name' && (
          <>
            <div className="flex justify-center mb-4">
              <Avatar avatarId={selectedAvatar} size="xl" />
            </div>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
              Con tên gì?
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
              placeholder="Nhập tên con..."
              maxLength={20}
              className="w-full text-2xl text-center font-bold border-3 border-blue-300 rounded-2xl py-4 px-4 mb-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center mb-2 font-bold">{passwordError}</p>
            )}
            {!isNewEmailAccount && (
              <p className="text-xs text-gray-400 text-center mb-4">
                Mật khẩu mặc định: {DEFAULT_PASSWORD}
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => setStep('create-avatar')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button
                onClick={handleCreateAccount}
                fullWidth
                size="lg"
                variant={isNewEmailAccount ? 'primary' : 'success'}
              >
                {isNewEmailAccount ? 'Tiếp theo →' : 'Bắt đầu!'}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsNewEmailAccount(!isNewEmailAccount)}
                className="text-sm text-blue-500 hover:text-blue-700 underline"
              >
                {isNewEmailAccount ? 'Tạo tài khoản trên máy' : 'Đăng ký bằng Email (đồng bộ đám mây)'}
              </button>
            </div>
          </>
        )}

        {/* Create email account — enter email */}
        {step === 'create-email' && (
          <>
            <div className="flex justify-center mb-4">
              <Avatar avatarId={selectedAvatar} size="xl" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-700">
              Nhập Email
            </h2>
            <p className="text-xs text-gray-400 text-center mb-4">
              Dùng email để đồng bộ dữ liệu trên nhiều thiết bị
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && email.trim() && setStep('create-password')}
              placeholder="Email..."
              className="w-full text-lg font-bold border-3 border-blue-300 rounded-2xl py-3 px-4 mb-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center mb-2 font-bold">{passwordError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep('create-name')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button
                onClick={() => { if (email.trim()) { setPasswordError(''); setStep('create-password'); } }}
                fullWidth
                size="lg"
                variant="primary"
              >
                Tiếp theo →
              </Button>
            </div>
          </>
        )}

        {/* Create email account — enter password */}
        {step === 'create-password' && (
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center mb-4">
              <Avatar avatarId={selectedAvatar} size="xl" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-700">
              Tạo mật khẩu
            </h2>
            <p className="text-xs text-gray-400 text-center mb-4">
              Ít nhất 6 ký tự
            </p>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => { setEmailPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailRegister()}
              placeholder="Mật khẩu..."
              className="w-full text-lg font-bold border-3 border-blue-300 rounded-2xl py-3 px-4 mb-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center mb-2 font-bold">{passwordError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep('create-email')} variant="ghost" size="lg">
                ← Quay lại
              </Button>
              <Button onClick={handleEmailRegister} fullWidth size="lg" variant="success" disabled={emailLoading}>
                {emailLoading ? 'Đang tạo...' : 'Bắt đầu!'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
