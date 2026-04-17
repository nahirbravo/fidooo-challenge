import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PinoLogger } from 'nestjs-pino';
import type { EnvConfig } from '../config/config.module';
import { FirebaseService } from '../firebase/firebase.service';

interface LivenessResponse {
  status: 'ok';
  uptime: number;
  version: string;
}

interface ReadinessResponse {
  status: 'ok';
  checks: { firestore: 'ok' };
}

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService<EnvConfig>,
    private readonly firebase: FirebaseService,
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Shallow check — returns 200 as long as the process is up.',
  })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  liveness(): LivenessResponse {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      version: this.config.getOrThrow<string>('API_VERSION'),
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Deep check — verifies the process can reach Firestore. Returns 503 if the dependency is unavailable so orchestrators stop routing traffic.',
  })
  @ApiResponse({ status: 200, description: 'All dependencies reachable' })
  @ApiResponse({ status: 503, description: 'A dependency is unavailable' })
  @HttpCode(HttpStatus.OK)
  async readiness(): Promise<ReadinessResponse> {
    try {
      await this.firebase.ping();
      return { status: 'ok', checks: { firestore: 'ok' } };
    } catch (error) {
      this.logger.error({ error }, 'Readiness probe failed: Firestore unreachable');
      throw new ServiceUnavailableException({
        status: 'unavailable',
        checks: { firestore: 'unreachable' },
      });
    }
  }
}
