import { UidThrottlerGuard } from '../guards/uid-throttler.guard';

describe('UidThrottlerGuard', () => {
  const guard = Object.create(
    UidThrottlerGuard.prototype,
  ) as UidThrottlerGuard;

  it('returns the authenticated uid when present', async () => {
    const tracker = await (
      guard as unknown as {
        getTracker: (req: Record<string, unknown>) => Promise<string>;
      }
    ).getTracker({ user: { uid: 'user-1', email: 'a@b.com' }, ip: '1.2.3.4' });

    expect(tracker).toBe('user-1');
  });

  it('falls back to the request IP when no user is attached', async () => {
    const tracker = await (
      guard as unknown as {
        getTracker: (req: Record<string, unknown>) => Promise<string>;
      }
    ).getTracker({ ip: '1.2.3.4' });

    expect(tracker).toBe('1.2.3.4');
  });
});
