import {
  type PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { formatZodError } from '@fidooo/shared';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: formatZodError(result.error),
        },
      });
    }

    return result.data;
  }
}
