import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptSuggestions } from '@/features/chat/components/PromptSuggestions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'chat.prompts.code.title': 'Explicar código',
      'chat.prompts.code.hint': 'Pegá una función',
      'chat.prompts.code.text': 'Explicame este código:\n\n',
      'chat.prompts.explain.title': 'Entender una idea',
      'chat.prompts.explain.hint': 'Concepto a simple',
      'chat.prompts.explain.text': 'Explicame qué es ',
      'chat.prompts.write.title': 'Redactar un texto',
      'chat.prompts.write.hint': 'Email o post',
      'chat.prompts.write.text': 'Escribime un email sobre ',
      'chat.prompts.solve.title': 'Resolver un problema',
      'chat.prompts.solve.hint': 'Plantealo',
      'chat.prompts.solve.text': 'Necesito ayuda con ',
    };
    return map[key] ?? key;
  },
}));

describe('PromptSuggestions', () => {
  it('renders the four prompt cards', () => {
    render(<PromptSuggestions onSelect={vi.fn()} />);
    expect(screen.getByText('Explicar código')).toBeInTheDocument();
    expect(screen.getByText('Entender una idea')).toBeInTheDocument();
    expect(screen.getByText('Redactar un texto')).toBeInTheDocument();
    expect(screen.getByText('Resolver un problema')).toBeInTheDocument();
  });

  it('renders each card as listitem inside a list container', () => {
    render(<PromptSuggestions onSelect={vi.fn()} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('invokes onSelect with the prompt text when a card is clicked', async () => {
    const onSelect = vi.fn();
    render(<PromptSuggestions onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Explicar código'));
    expect(onSelect).toHaveBeenCalledWith('Explicame este código:\n\n');
  });

  it('uses the matching text for each card', async () => {
    const onSelect = vi.fn();
    render(<PromptSuggestions onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Resolver un problema'));
    expect(onSelect).toHaveBeenLastCalledWith('Necesito ayuda con ');
  });
});
