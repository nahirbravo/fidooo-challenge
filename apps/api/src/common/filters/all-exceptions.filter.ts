import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { FastifyReply } from 'fastify';

interface ErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

const FALLBACK_BODY: ErrorBody = {
  ok: false,
  error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = { ...FALLBACK_BODY };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      body =
        typeof response === 'object'
          ? (response as Record<string, unknown>)
          : {
              ok: false,
              error: {
                code: 'INTERNAL_ERROR',
                message: String(response),
              },
            };
    }

    const errorCode = (body['error'] as Record<string, unknown> | undefined)?.[
      'code'
    ];

    if (status >= 500 && !(exception instanceof HttpException)) {
      this.logger.error(
        { status, errorCode, err: exception },
        'Unhandled exception (5xx)',
      );
    } else if (status >= 500) {
      this.logger.error({ status, errorCode }, 'Server error response');
    } else {
      this.logger.warn({ status, errorCode }, 'Client error response');
    }

    void reply.status(status).send(body);
  }
}
