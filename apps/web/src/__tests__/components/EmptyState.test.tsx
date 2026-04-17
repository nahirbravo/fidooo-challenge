import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/features/chat/components/EmptyState';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'chat.emptyTitle': '¿Qué querés resolver hoy?',
      'chat.emptySubtitle': 'Empezá una conversación o probá una sugerencia.',
    };
    return map[key] ?? key;
  },
}));

describe('EmptyState', () => {
  it('renders the editorial title as a heading', () => {
    render(<EmptyState />);
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveTextContent('¿Qué querés resolver hoy?');
  });

  it('renders the supporting subtitle', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('Empezá una conversación o probá una sugerencia.'),
    ).toBeInTheDocument();
  });
});
