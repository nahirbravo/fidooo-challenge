'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations();

  logger.error('ErrorPage.render', { message: error.message, digest: error.digest });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-heading font-semibold">{t('common.error')}</h1>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {t('errors.generic')}
      </p>
      <Button onClick={reset}>{t('common.retry')}</Button>
    </div>
  );
}
