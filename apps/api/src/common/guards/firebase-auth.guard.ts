import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { FirebaseService } from '../../firebase/firebase.service';
import { getFirebaseErrorCode } from '../utils/firebase-error';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        ok: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Missing or malformed Authorization header',
        },
      });
    }

    const token = authHeader.slice(7);

    try {
      const decoded = await this.firebaseService.verifyIdToken(token);

      (request as FastifyRequest & { user: AuthenticatedUser }).user = {
        uid: decoded.uid,
        email: decoded.email ?? null,
      };

      return true;
    } catch (error: unknown) {
      const isExpired =
        getFirebaseErrorCode(error) === 'auth/id-token-expired';

      throw new UnauthorizedException({
        ok: false,
        error: {
          code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
          message: isExpired ? 'Token has expired' : 'Invalid token',
        },
      });
    }
  }
}
