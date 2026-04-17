import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import type { FirebaseService } from '../../firebase/firebase.service';

function createMockContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockFirebaseService: Partial<FirebaseService>;

  beforeEach(() => {
    mockFirebaseService = {
      verifyIdToken: jest.fn(),
    };
    guard = new FirebaseAuthGuard(mockFirebaseService as FirebaseService);
  });

  it('allows request with valid token', async () => {
    (mockFirebaseService.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-1',
      email: 'test@email.com',
    });

    const result = await guard.canActivate(
      createMockContext('Bearer valid-token'),
    );
    expect(result).toBe(true);
  });

  it('throws 401 when no Authorization header', async () => {
    await expect(
      guard.canActivate(createMockContext()),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when header does not start with Bearer', async () => {
    await expect(
      guard.canActivate(createMockContext('Basic token')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 with TOKEN_INVALID for invalid token', async () => {
    (mockFirebaseService.verifyIdToken as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );

    try {
      await guard.canActivate(createMockContext('Bearer invalid'));
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      const response = (error as UnauthorizedException).getResponse() as Record<string, unknown>;
      const errBody = response['error'] as Record<string, string>;
      expect(errBody['code']).toBe('TOKEN_INVALID');
    }
  });

  it('throws 401 with TOKEN_EXPIRED for expired token', async () => {
    const expiredError = { code: 'auth/id-token-expired' };
    (mockFirebaseService.verifyIdToken as jest.Mock).mockRejectedValue(expiredError);

    try {
      await guard.canActivate(createMockContext('Bearer expired'));
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      const response = (error as UnauthorizedException).getResponse() as Record<string, unknown>;
      const errBody = response['error'] as Record<string, string>;
      expect(errBody['code']).toBe('TOKEN_EXPIRED');
    }
  });
});
