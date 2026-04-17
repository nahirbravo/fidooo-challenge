import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    message: z.string().min(1).max(100),
  });
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('passes valid data through', () => {
    const result = pipe.transform({ message: 'Hello' });
    expect(result).toEqual({ message: 'Hello' });
  });

  it('throws BadRequestException for invalid data', () => {
    expect(() => pipe.transform({ message: '' })).toThrow(BadRequestException);
  });

  it('throws BadRequestException for missing fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('returns parsed data (strips extra fields)', () => {
    const result = pipe.transform({ message: 'Hello', extra: 'field' });
    expect(result).toEqual({ message: 'Hello' });
  });

  it('includes error details in exception', () => {
    try {
      pipe.transform({ message: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response['ok']).toBe(false);
      expect(response['error']).toHaveProperty('code', 'VALIDATION_ERROR');
    }
  });
});
