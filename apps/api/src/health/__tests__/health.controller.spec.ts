import type { ConfigService } from '@nestjs/config';
import type { PinoLogger } from 'nestjs-pino';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from '../health.controller';
import type { FirebaseService } from '../../firebase/firebase.service';
import type { EnvConfig } from '../../config/config.module';

describe('HealthController', () => {
  const config = {
    getOrThrow: jest.fn((key: string) =>
      key === 'API_VERSION' ? '9.9.9' : undefined,
    ),
  };
  const logger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() };

  function makeController(firebase: Partial<FirebaseService>) {
    return new HealthController(
      config as unknown as ConfigService<EnvConfig>,
      firebase as FirebaseService,
      logger as unknown as PinoLogger,
    );
  }

  describe('liveness', () => {
    it('returns ok status with version from env and a numeric uptime', () => {
      const controller = makeController({ ping: jest.fn() });
      const result = controller.liveness();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('9.9.9');
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('readiness', () => {
    it('returns ok when Firestore is reachable', async () => {
      const ping = jest.fn().mockResolvedValue(undefined);
      const controller = makeController({ ping });
      const result = await controller.readiness();
      expect(ping).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ status: 'ok', checks: { firestore: 'ok' } });
    });

    it('throws 503 when Firestore is unreachable', async () => {
      const ping = jest.fn().mockRejectedValue(new Error('boom'));
      const controller = makeController({ ping });
      await expect(controller.readiness()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });
});
