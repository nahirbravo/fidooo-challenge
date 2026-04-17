import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv, type EnvConfig } from './env.schema';

const envFilePath = resolve(__dirname, '../../.env');

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validate: validateEnv,
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}

export { ConfigService, type EnvConfig };
