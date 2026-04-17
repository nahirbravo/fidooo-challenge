'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  const t = useTranslations();

  return (
    <div
      className={cn('flex flex-1 items-center justify-center', className)}
      role="status"
      aria-label={t('common.loading')}
    >
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

LoadingState.displayName = 'LoadingState';
