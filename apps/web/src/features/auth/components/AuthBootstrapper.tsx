'use client';

import { useEffect } from 'react';
import { configureApiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores';
import {
  getIdToken,
  onAuthStateChanged,
  onIdTokenChanged,
  signOut as authSignOut,
} from '../services/auth-service';
import { deleteSessionCookie, setSessionCookie } from '../services/session-service';
import { logger } from '@/lib/logger';

export function AuthBootstrapper() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    setAuthStatus('loading');
    configureApiClient({
      refreshToken: () => getIdToken(true),
      invalidateSession: async () => {
        await authSignOut();
        await deleteSessionCookie();
        clearUser();
      },
    });

    const unsubscribeAuth = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        return;
      }

      clearUser();
    });

    const unsubscribeToken = onIdTokenChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        await deleteSessionCookie();
        return;
      }

      try {
        await setSessionCookie(await firebaseUser.getIdToken());
      } catch (error) {
        logger.error('authBootstrapper.onIdTokenChanged', { error });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [clearUser, setAuthStatus, setUser]);

  return null;
}
