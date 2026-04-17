import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/components/ui/password-input';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'field.showPassword': 'Mostrar contraseña',
      'field.hidePassword': 'Ocultar contraseña',
    };
    return map[key] ?? key;
  },
}));

function getInput(): HTMLInputElement {
  return screen.getByPlaceholderText('••••••••') as HTMLInputElement;
}

describe('PasswordInput', () => {
  it('renders an input of type password by default', () => {
    render(<PasswordInput placeholder="••••••••" />);
    expect(getInput()).toHaveAttribute('type', 'password');
  });

  it('renders the toggle with show label and aria-pressed=false initially', () => {
    render(<PasswordInput placeholder="••••••••" />);
    const toggle = screen.getByRole('button', {
      name: 'Mostrar contraseña',
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles input type to text when the button is clicked', async () => {
    render(<PasswordInput placeholder="••••••••" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' }),
    );
    expect(getInput()).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Ocultar contraseña' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles back to password type after a second click', async () => {
    render(<PasswordInput placeholder="••••••••" />);
    const toggle = () =>
      screen.getByRole('button', { name: /contraseña/i });
    await userEvent.click(toggle());
    await userEvent.click(toggle());
    expect(getInput()).toHaveAttribute('type', 'password');
  });

  it('forwards the ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} placeholder="••••••••" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('hides the lock icon when hideLockIcon is true', () => {
    const { container } = render(
      <PasswordInput placeholder="••••••••" hideLockIcon />,
    );
    expect(container.querySelector('.auth-input-icon')).toBeNull();
  });
});
