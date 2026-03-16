'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useUserStore } from '@/stores/useUserStore';

type Step = 'enter' | 'create' | 'confirm';

export default function ParentLoginPage() {
  const router = useRouter();
  const parentPin = useUserStore((s) => s.parentPin);
  const setParentPin = useUserStore((s) => s.setParentPin);

  const [step, setStep] = useState<Step>(parentPin ? 'enter' : 'create');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const handlePinInput = (value: string, setter: (v: string) => void) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setter(digits);
    setError('');
  };

  const handleVerify = () => {
    if (pin.length < 4) {
      setError('Vui lòng nhập mã PIN (4-6 số)');
      return;
    }
    if (pin === parentPin) {
      router.push('/parent/dashboard');
    } else {
      setError('Mã PIN không đúng. Vui lòng thử lại.');
      setPin('');
    }
  };

  const handleCreatePin = () => {
    if (newPin.length < 4) {
      setError('Mã PIN phải có ít nhất 4 số');
      return;
    }
    setStep('confirm');
    setPin('');
    setError('');
  };

  const handleConfirmPin = () => {
    if (pin !== newPin) {
      setError('Mã PIN không khớp. Vui lòng nhập lại.');
      setPin('');
      return;
    }
    setParentPin(newPin);
    router.push('/parent/dashboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  // Create PIN screen
  if (step === 'create') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="w-full max-w-sm text-center">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">Tạo mã PIN</h1>
            <p className="text-gray-500 text-sm mb-6">
              Tạo mã PIN (4-6 số) để bảo vệ khu vực phụ huynh
            </p>

            <input
              type="password"
              value={newPin}
              onChange={(e) => handlePinInput(e.target.value, setNewPin)}
              onKeyDown={(e) => handleKeyDown(e, handleCreatePin)}
              placeholder="Nhập mã PIN mới..."
              maxLength={6}
              autoFocus
              className="w-full text-3xl text-center font-bold border-2 border-gray-200 rounded-2xl py-4 mb-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 tracking-[0.5em]"
              inputMode="numeric"
            />

            {/* PIN dots indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < newPin.length
                      ? 'bg-purple-500 scale-110'
                      : i < 4
                        ? 'bg-gray-300'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <Button onClick={handleCreatePin} fullWidth size="lg" variant="primary">
              Tiếp tục
            </Button>

            <button
              onClick={() => router.back()}
              className="mt-4 text-gray-400 text-sm hover:text-gray-600"
            >
              Quay lại
            </button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Confirm PIN screen
  if (step === 'confirm') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="w-full max-w-sm text-center">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">Xác nhận mã PIN</h1>
            <p className="text-gray-500 text-sm mb-6">
              Nhập lại mã PIN để xác nhận
            </p>

            <input
              type="password"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              onKeyDown={(e) => handleKeyDown(e, handleConfirmPin)}
              placeholder="Nhập lại mã PIN..."
              maxLength={6}
              autoFocus
              className="w-full text-3xl text-center font-bold border-2 border-gray-200 rounded-2xl py-4 mb-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 tracking-[0.5em]"
              inputMode="numeric"
            />

            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < pin.length
                      ? 'bg-purple-500 scale-110'
                      : i < 4
                        ? 'bg-gray-300'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-500 text-sm mb-3">
                {error}
              </motion.p>
            )}

            <Button onClick={handleConfirmPin} fullWidth size="lg" variant="primary">
              Xác nhận & Đăng nhập
            </Button>

            <button
              onClick={() => { setStep('create'); setPin(''); setNewPin(''); setError(''); }}
              className="mt-4 text-gray-400 text-sm hover:text-gray-600"
            >
              Quay lại tạo PIN mới
            </button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Enter existing PIN screen
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="w-full max-w-sm text-center">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Phụ Huynh</h1>
          <p className="text-gray-500 text-sm mb-6">Nhập mã PIN để truy cập</p>

          <input
            type="password"
            value={pin}
            onChange={(e) => handlePinInput(e.target.value, setPin)}
            onKeyDown={(e) => handleKeyDown(e, handleVerify)}
            placeholder="Mã PIN..."
            maxLength={6}
            autoFocus
            className="w-full text-3xl text-center font-bold border-2 border-gray-200 rounded-2xl py-4 mb-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 tracking-[0.5em]"
            inputMode="numeric"
          />

          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < pin.length
                    ? 'bg-blue-500 scale-110'
                    : i < 4
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-500 text-sm mb-3">
              {error}
            </motion.p>
          )}

          <Button onClick={handleVerify} fullWidth size="lg" variant="primary">
            Đăng nhập
          </Button>

          <button
            onClick={() => router.back()}
            className="mt-4 text-gray-400 text-sm hover:text-gray-600"
          >
            Quay lại
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
