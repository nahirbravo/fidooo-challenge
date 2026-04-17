'use client';

import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppHeader } from './AppHeader';
import { ErrorFallback } from './ErrorFallback';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="chat-app flex h-dvh flex-col">
        <AppHeader />
        <main className="chat-main-content">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
