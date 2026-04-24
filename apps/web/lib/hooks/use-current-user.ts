'use client';

import { useSession } from 'next-auth/react';
import type { SessionUser } from '@/lib/auth/schemas';

export interface CurrentUser {
  user: SessionUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isClient: boolean;
  isPro: boolean;
  isAdmin: boolean;
}

/**
 * Joriy foydalanuvchi ma'lumotlarini qaytaradi.
 * useSession() wrapper — typed va qulay flaglar bilan.
 */
export function useCurrentUser(): CurrentUser {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isClient: user?.role === 'client',
    isPro: user?.role === 'pro',
    isAdmin: user?.role === 'admin',
  };
}
