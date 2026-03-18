'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/useUserStore';
import { useGameStore } from '@/stores/useGameStore';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const navItems = [
  { href: '/home', label: 'Trang chủ', icon: '🏠' },
  { href: '/practice', label: 'Học tập', icon: '📖' },
  { href: '/games', label: 'Trò chơi', icon: '🎮' },
  { href: '/leaderboard', label: 'Xếp hạng', icon: '🏆' },
  { href: '/profile', label: 'Hồ sơ', icon: '👤' },
];

// Routes where gameplay/practice can happen
const GAME_ROUTES = [
  '/games/racing',
  '/games/shooting',
  '/games/puzzle',
  '/practice/multiplication',
  '/practice/mental-math',
  '/practice/mixed',
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isPlaying = useGameStore((s) => s.isPlaying);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isOnGameRoute = GAME_ROUTES.some((route) => pathname.startsWith(route));

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    // If currently on a game route and playing, intercept navigation
    if (isOnGameRoute && isPlaying) {
      e.preventDefault();
      setPendingHref(href);
      setShowConfirm(true);
    }
  }, [isOnGameRoute, isPlaying]);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    if (pendingHref) {
      // Reset game state before navigating
      useGameStore.getState().reset();
      router.push(pendingHref);
      setPendingHref(null);
    }
  }, [pendingHref, router]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setPendingHref(null);
  }, []);

  // Also warn on browser back/refresh
  useEffect(() => {
    if (!isOnGameRoute || !isPlaying) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOnGameRoute, isPlaying]);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Avatar avatarId={user?.avatarId || 1} size="sm" />
          <div>
            <p className="font-bold text-gray-800 text-sm">{user?.displayName || 'Bé'}</p>
            <p className="text-xs text-gray-500">Lv.{user?.stats.level || 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
            <span>⭐</span>
            <span className="font-bold text-yellow-700 text-sm">{user?.stats.totalStars || 0}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
            <span>🔥</span>
            <span className="font-bold text-purple-700 text-sm">{user?.stats.currentStreak || 0}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 safe-area">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px] ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Confirm dialog when leaving game */}
      <ConfirmDialog
        open={showConfirm}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
