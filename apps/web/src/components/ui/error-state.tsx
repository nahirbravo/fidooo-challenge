'use client';

import { useTranslations } from 'next-intl';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  variant?: 'network' | 'generic';
  onRetry?: () => void;
  className?: string;
}

const iconMap = {
  network: WifiOff,
  generic: AlertTriangle,
} as const;

export function ErrorState({
  message,
  variant = 'generic',
  onRetry,
  className,
}: ErrorStateProps) {
  const t = useTranslations();
  const Icon = iconMap[variant];

  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center', className)}>
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <Icon className="size-8 text-destructive" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          {t('common.error')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {message ?? t('errors.generic')}
        </p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline">
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  );
}

ErrorState.displayName = 'ErrorState';
