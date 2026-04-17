'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const t = useTranslations();

  logger.error('ErrorFallback.render', {
    message: error instanceof Error ? error.message : String(error),
  });

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50dvh]"
    >
      <h2 className="text-xl font-semibold font-heading text-foreground">
        {t('common.error')}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {t('errors.generic')}
      </p>
      <Button onClick={resetErrorBoundary}>
        {t('common.retry')}
      </Button>
    </div>
  );
}

ErrorFallback.displayName = 'ErrorFallback';
