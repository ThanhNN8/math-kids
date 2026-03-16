'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ParentLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Simple PIN verification for parent access
    if (password === '1234' || password.length >= 4) {
      router.push('/parent/dashboard');
    } else {
      setError('Vui lòng nhập mã PIN (4 số)');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black text-gray-800 mb-2">Phụ Huynh</h1>
          <p className="text-gray-500 text-sm mb-6">Nhập mã PIN để truy cập</p>

          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Mã PIN..."
            maxLength={6}
            className="w-full text-3xl text-center font-bold border-2 border-gray-200 rounded-2xl py-4 mb-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 tracking-[0.5em]"
            inputMode="numeric"
          />

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <Button onClick={handleLogin} fullWidth size="lg" variant="primary">
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
