import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFirebaseSignIn = vi.fn();
const mockFirebaseSignUp = vi.fn();
const mockFirebaseResetPassword = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock('@/lib/firebase/auth', () => ({
  firebaseSignIn: (...args: unknown[]) => mockFirebaseSignIn(...args),
  firebaseSignUp: (...args: unknown[]) => mockFirebaseSignUp(...args),
  firebaseResetPassword: (...args: unknown[]) => mockFirebaseResetPassword(...args),
  firebaseSignOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  firebaseOnAuthStateChanged: vi.fn(),
  firebaseOnIdTokenChanged: vi.fn(),
  firebaseGetIdToken: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import {
  signIn,
  signUp,
  resetPassword,
  signOut,
  AuthServiceError,
} from '@/features/auth/services/auth-service';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('calls Firebase signIn on success', async () => {
      mockFirebaseSignIn.mockResolvedValue({ user: { uid: '1' } });
      await signIn('test@email.com', 'Password1');
      expect(mockFirebaseSignIn).toHaveBeenCalledWith('test@email.com', 'Password1');
    });

    it('throws AuthServiceError with i18n key on Firebase error', async () => {
      mockFirebaseSignIn.mockRejectedValue({ code: 'auth/wrong-password' });

      try {
        await signIn('test@email.com', 'wrong');
        expect.fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthServiceError);
        expect((error as AuthServiceError).i18nKey).toBe('auth.login.error');
      }
    });

    it('throws AuthServiceError with generic key on unknown error', async () => {
      mockFirebaseSignIn.mockRejectedValue(new Error('unknown'));

      try {
        await signIn('test@email.com', 'pass');
        expect.fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthServiceError);
        expect((error as AuthServiceError).i18nKey).toBe('errors.generic');
      }
    });

    it('translates email-already-in-use error', async () => {
      mockFirebaseSignUp.mockRejectedValue({ code: 'auth/email-already-in-use' });

      try {
        await signUp('existing@email.com', 'Password1');
        expect.fail('should have thrown');
      } catch (error) {
        expect((error as AuthServiceError).i18nKey).toBe('auth.register.emailExists');
      }
    });

    it('translates rate limit error', async () => {
      mockFirebaseSignIn.mockRejectedValue({ code: 'auth/too-many-requests' });

      try {
        await signIn('test@email.com', 'pass');
        expect.fail('should have thrown');
      } catch (error) {
        expect((error as AuthServiceError).i18nKey).toBe('errors.rateLimited');
      }
    });

    it('translates network error', async () => {
      mockFirebaseSignIn.mockRejectedValue({ code: 'auth/network-request-failed' });

      try {
        await signIn('test@email.com', 'pass');
        expect.fail('should have thrown');
      } catch (error) {
        expect((error as AuthServiceError).i18nKey).toBe('errors.network');
      }
    });
  });

  describe('signUp', () => {
    it('calls Firebase signUp on success', async () => {
      mockFirebaseSignUp.mockResolvedValue({ user: { uid: '1' } });
      await signUp('test@email.com', 'Password1');
      expect(mockFirebaseSignUp).toHaveBeenCalledWith('test@email.com', 'Password1');
    });
  });

  describe('resetPassword', () => {
    it('calls Firebase resetPassword and never throws', async () => {
      mockFirebaseResetPassword.mockRejectedValue(new Error('not found'));
      await resetPassword('test@email.com');
      expect(mockFirebaseResetPassword).toHaveBeenCalledWith('test@email.com');
    });
  });

  describe('signOut', () => {
    it('calls Firebase signOut', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);
      await signOut();
      expect(mockFirebaseSignOut).toHaveBeenCalled();
    });

    it('throws AuthServiceError on failure', async () => {
      mockFirebaseSignOut.mockRejectedValue(new Error('fail'));

      try {
        await signOut();
        expect.fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthServiceError);
      }
    });
  });
});
