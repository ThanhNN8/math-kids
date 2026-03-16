'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/parent/dashboard', label: 'Tổng quan', icon: '📊' },
  { href: '/parent/progress', label: 'Tiến trình', icon: '📈' },
  { href: '/parent/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show nav on login page
  if (pathname === '/parent') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-gray-800">Phụ Huynh</h1>
        <div className="flex gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => router.push('/home')}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Quay lại
        </button>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
