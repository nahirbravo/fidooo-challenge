import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { ConfigService, type EnvConfig } from './config/config.module';

function resolveAllowedOrigins(
  corsOrigin: string,
  nodeEnv: EnvConfig['NODE_ENV'],
): string[] {
  const configuredOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (nodeEnv === 'production') {
    return configuredOrigins;
  }

  const loopbackHosts = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];
  const allowedOrigins = new Set<string>(configuredOrigins);

  for (const configuredOrigin of configuredOrigins) {
    try {
      const url = new URL(configuredOrigin);
      if (!loopbackHosts.includes(url.hostname)) {
        continue;
      }

      for (const host of loopbackHosts) {
        allowedOrigins.add(`${url.protocol}//${host}${url.port ? `:${url.port}` : ''}`);
      }
    } catch {
      allowedOrigins.add(configuredOrigin);
    }
  }

  return [...allowedOrigins];
}

function hasFastifyStatic(): boolean {
  try {
    require.resolve('@fastify/static');
    return true;
  } catch {
    return false;
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  const logger = app.get(Logger);
  const configService = app.get(ConfigService<EnvConfig>);
  const port = configService.getOrThrow<number>('PORT');
  const nodeEnv = configService.getOrThrow<EnvConfig['NODE_ENV']>('NODE_ENV');
  const corsOrigin = configService.getOrThrow<string>('CORS_ORIGIN');
  const allowedOrigins = resolveAllowedOrigins(corsOrigin, nodeEnv);

  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: nodeEnv === 'production',
  });

  if (nodeEnv !== 'production') {
    if (hasFastifyStatic()) {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('Fidooo Chat API')
        .setDescription('Backend for Fidooo Chat — Firebase Auth + OpenAI')
        .setVersion('1.0.0')
        .addBearerAuth({
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Firebase ID Token',
        })
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api/docs', app, document);
    }
  }

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
