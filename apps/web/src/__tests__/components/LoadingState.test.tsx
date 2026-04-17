import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '@/components/ui/loading-state';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'common.loading': 'Cargando...',
    };
    return map[key] ?? key;
  },
}));

describe('LoadingState', () => {
  it('renders with role="status"', () => {
    render(<LoadingState />);
    const el = screen.getByRole('status');
    expect(el).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<LoadingState />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('renders spinner animation', () => {
    render(<LoadingState />);
    const spinner = screen.getByRole('status').firstChild;
    expect(spinner).toHaveClass('animate-spin');
  });

  it('accepts custom className', () => {
    render(<LoadingState className="min-h-screen" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('min-h-screen');
  });
});
