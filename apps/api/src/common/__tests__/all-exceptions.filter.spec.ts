import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import type { PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';

function makeHost(): {
  host: ArgumentsHost;
  reply: { status: jest.Mock; send: jest.Mock };
} {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockResolvedValue(undefined),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ArgumentsHost;
  return { host, reply };
}

describe('AllExceptionsFilter', () => {
  const logger = { warn: jest.fn(), error: jest.fn() };
  const filter = new AllExceptionsFilter(logger as unknown as PinoLogger);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('echoes a HttpException response and logs as warn for 4xx', () => {
    const { host, reply } = makeHost();
    filter.catch(
      new BadRequestException({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'invalid' },
      }),
      host,
    );

    expect(reply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('falls back to INTERNAL_ERROR + 500 + error log with stack for non-HttpException', () => {
    const { host, reply } = makeHost();
    const boom = new Error('boom');

    filter.catch(boom, host);

    expect(reply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: boom, status: 500 }),
      expect.any(String),
    );
  });
});
