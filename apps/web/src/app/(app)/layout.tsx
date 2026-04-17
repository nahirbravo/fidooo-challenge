import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getSessionUser } from '@/server/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/api/auth/sign-out');
  }

  return <AppShell>{children}</AppShell>;
}
