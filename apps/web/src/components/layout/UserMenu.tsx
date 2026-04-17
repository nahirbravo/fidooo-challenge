'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemePicker } from '@/features/settings/components/ThemePicker';
import { LanguagePicker } from '@/features/settings/components/LanguagePicker';
import { useAuth } from '@/features/auth/hooks/useAuth';

function getInitial(email: string | null | undefined): string {
  const trimmed = email?.trim() ?? '';
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function UserMenu() {
  const t = useTranslations();
  const { user, signOut } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsLogoutOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user?.email) return null;

  const email = user.email;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={email}
          title={email}
          className="chat-avatar-trigger"
        >
          {getInitial(email)}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="chat-user-menu"
        >
          <div className="chat-user-menu-identity">
            <span className="chat-user-menu-avatar" aria-hidden="true">
              {getInitial(email)}
            </span>
            <p className="chat-user-menu-email" title={email}>
              {email}
            </p>
          </div>

          <DropdownMenuSeparator />

          <div className="space-y-1.5 px-2 py-2">
            <p className="text-[0.7rem] font-medium tracking-[0.12px] text-muted-foreground">
              {t('settings.appearance')}
            </p>
            <ThemePicker />
          </div>

          <DropdownMenuSeparator />

          <div className="space-y-1.5 px-2 py-2">
            <p className="text-[0.7rem] font-medium tracking-[0.12px] text-muted-foreground">
              {t('settings.language')}
            </p>
            <LanguagePicker />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsLogoutOpen(true)}
            className="gap-2 px-2 py-2"
          >
            <LogOut className="size-4" strokeWidth={1.6} aria-hidden="true" />
            <span>{t('settings.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.logoutConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.logoutConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              {t('settings.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleLogout}
              isLoading={isLoggingOut}
            >
              {t('settings.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

UserMenu.displayName = 'UserMenu';
