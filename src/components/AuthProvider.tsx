'use client';

import { useEffect } from 'react';
import { onAuthChange } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setFirebaseUser(firebaseUser.uid, firebaseUser.email);

        // If no local user is loaded, try to fetch from Firestore
        const currentUser = useUserStore.getState().user;
        if (!currentUser || currentUser.uid !== firebaseUser.uid) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            if (profile) {
              setUser({
                ...profile,
                ownedItems: profile.ownedItems ?? [],
                email: firebaseUser.email || profile.email,
                authProvider: 'firebase',
              });
            }
          } catch (err) {
            console.warn('[AuthProvider] Failed to fetch profile:', err);
          }
        }
      } else {
        // No Firebase user — don't clear local user (they may be using local account)
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, clearAuth, setAuthReady, setUser]);

  return <>{children}</>;
}
