import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserMenu } from '@/components/layout/UserMenu';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'settings.appearance': 'Apariencia',
      'settings.language': 'Idioma',
      'settings.logout': 'Cerrar sesión',
      'settings.logoutConfirm': '¿Cerrar sesión?',
      'settings.logoutConfirmDesc': 'Vas a cerrar tu sesión actual',
      'settings.cancel': 'Cancelar',
      'theme.light': 'Claro',
      'theme.dark': 'Oscuro',
      'theme.system': 'Automático',
      'language.es': 'Español',
      'language.en': 'English',
      'toast.themeChanged': 'Tema actualizado',
      'toast.languageChanged': 'Idioma actualizado',
    };
    return map[key] ?? key;
  },
  useLocale: () => 'es',
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'system', setTheme: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

const signOutMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'u1',
      email: 'emiliano@example.com',
      displayName: null,
      photoURL: null,
    },
    signOut: signOutMock,
  }),
}));

describe('UserMenu', () => {
  it('renders the avatar trigger with the email initial', () => {
    render(<UserMenu />);
    const trigger = screen.getByLabelText('emiliano@example.com');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('E');
  });

  it('exposes the email both as title and aria-label for the trigger', () => {
    render(<UserMenu />);
    const trigger = screen.getByLabelText('emiliano@example.com');
    expect(trigger).toHaveAttribute('title', 'emiliano@example.com');
  });
});

describe('UserMenu — empty user', () => {
  it('renders nothing when user has no email', async () => {
    vi.resetModules();
    vi.doMock('@/features/auth/hooks/useAuth', () => ({
      useAuth: () => ({ user: null, signOut: vi.fn() }),
    }));
    const { UserMenu: ScopedUserMenu } = await import(
      '@/components/layout/UserMenu'
    );
    const { container } = render(<ScopedUserMenu />);
    expect(container.firstChild).toBeNull();
  });
});
