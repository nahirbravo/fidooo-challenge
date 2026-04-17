import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const REQUEST_ID_HEADER = 'x-request-id';
import {
  AppConfigModule,
  ConfigService,
  type EnvConfig,
} from './config/config.module';
import { FirebaseModule } from './firebase/firebase.module';
import { OpenAIModule } from './openai/openai.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { UidThrottlerGuard } from './common/guards/uid-throttler.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        pinoHttp: {
          transport:
            config.getOrThrow<EnvConfig['NODE_ENV']>('NODE_ENV') !==
            'production'
              ? { target: 'pino-pretty' }
              : undefined,
          redact: [
            'req.headers.authorization',
            'req.body.token',
            'req.body.password',
            'req.body.message',
          ],
          level: config.getOrThrow<EnvConfig['LOG_LEVEL']>('LOG_LEVEL'),
          genReqId: (req: IncomingMessage, res: ServerResponse): string => {
            const incoming = req.headers[REQUEST_ID_HEADER];
            const id =
              (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();
            res.setHeader(REQUEST_ID_HEADER, id);
            return id;
          },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => [
        {
          ttl: config.getOrThrow<number>('RATE_LIMIT_TTL') * 1000,
          limit: config.getOrThrow<number>('RATE_LIMIT_MAX'),
        },
      ],
    }),
    FirebaseModule,
    OpenAIModule,
    ChatModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UidThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
