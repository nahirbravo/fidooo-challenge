'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  resetPassword as authResetPassword,
  signOut as authSignOut,
  getIdToken,
  AuthServiceError,
} from '../services/auth-service';
import { deleteSessionCookie, setSessionCookie } from '../services/session-service';
import { feedback } from '@/lib/feedback';

export function useAuth() {
  const router = useRouter();
  const t = useTranslations();
  const { setLastEmail, clearUser, user, authStatus } =
    useAuthStore(useShallow((s) => ({
      setLastEmail: s.setLastEmail, clearUser: s.clearUser,
      user: s.user, authStatus: s.authStatus,
    })));

  const signIn = useCallback(async (email: string, password: string) => {
    await authSignIn(email, password);
    setLastEmail(email);
    const token = await getIdToken(true);
    if (token) await setSessionCookie(token);
    feedback.success(t('toast.loginSuccess'));
    router.replace('/chat');
  }, [setLastEmail, router, t]);

  const signUp = useCallback(async (email: string, password: string) => {
    await authSignUp(email, password);
    setLastEmail(email);
    const token = await getIdToken(true);
    if (token) await setSessionCookie(token);
    feedback.success(t('toast.registerSuccess'));
    router.replace('/chat');
  }, [setLastEmail, router, t]);

  const resetPassword = useCallback(async (email: string) => {
    await authResetPassword(email);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    await deleteSessionCookie();
    clearUser();
    feedback.confirm(t('toast.logoutSuccess'));
    router.replace('/login');
  }, [clearUser, router, t]);

  return { user, authStatus, signIn, signUp, resetPassword, signOut };
}

export { AuthServiceError };
