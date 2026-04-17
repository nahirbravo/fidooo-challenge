import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import type { AuthenticatedUser } from './firebase-auth.guard';

@Injectable()
export class UidThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as FastifyRequest & { user?: AuthenticatedUser };
    return request.user?.uid ?? request.ip;
  }
}
