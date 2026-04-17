import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/ui/error-state';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'common.error': 'Algo salió mal',
      'common.retry': 'Reintentar',
      'errors.generic': 'Algo salió mal',
      'errors.network': 'Error de conexión',
    };
    return map[key] ?? key;
  },
}));

describe('ErrorState', () => {
  it('renders error heading and fallback message', () => {
    render(<ErrorState />);
    const matches = screen.getAllByText('Algo salió mal');
    expect(matches.length).toBe(2);
  });

  it('renders custom message instead of fallback', () => {
    render(<ErrorState message="Error de conexión" />);
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('does not render retry button without onRetry', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders network variant icon', () => {
    const { container } = render(<ErrorState variant="network" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders generic variant icon', () => {
    const { container } = render(<ErrorState variant="generic" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<ErrorState className="min-h-screen" />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
