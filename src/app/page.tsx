'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-4xl animate-float">🧮</div>
    </div>
  );
}
