'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { QueryProvider } from './query-provider';
import { AuthBootstrapper } from '@/features/auth/components/AuthBootstrapper';

interface ProvidersProps {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

function ClaudeToaster() {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' | 'system' =
    resolvedTheme === 'dark' || resolvedTheme === 'light'
      ? resolvedTheme
      : 'system';

  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      richColors={false}
      closeButton={false}
      gap={8}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            'group/sonner !bg-popover !text-foreground !border !border-border !shadow-[0_0_0_1px_var(--app-ring-warm),0_4px_24px_rgba(20,20,19,0.06)] !rounded-xl !p-3.5 !gap-2',
          title: '!font-sans !text-sm !font-medium !text-foreground !tracking-normal',
          description: '!font-sans !text-xs !text-muted-foreground !leading-relaxed',
          actionButton:
            '!bg-primary !text-primary-foreground !rounded-md !px-3 !py-1.5 !text-xs !font-medium',
          cancelButton:
            '!bg-muted !text-muted-foreground !rounded-md !px-3 !py-1.5 !text-xs !font-medium',
          closeButton:
            '!border-border !bg-popover !text-muted-foreground hover:!bg-muted hover:!text-foreground',
          icon: '!size-4',
        },
      }}
    />
  );
}

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
        <QueryProvider>
          <AuthBootstrapper />
          {children}
          <ClaudeToaster />
        </QueryProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
