import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MessageInput,
  type MessageInputHandle,
} from '@/features/chat/components/MessageInput';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      'chat.inputPlaceholder': 'Escribí tu mensaje...',
      'chat.send': 'Enviar mensaje',
      'chat.kbd.send': 'para enviar',
      'chat.kbd.newline': 'para nueva línea',
    };
    if (key === 'chat.charCount' && params) {
      return `${params['count']}/${params['max']}`;
    }
    return map[key] ?? key;
  },
}));

function getTextarea() {
  return screen.getByPlaceholderText('Escribí tu mensaje...') as HTMLTextAreaElement;
}

describe('MessageInput', () => {
  it('renders textarea and send button', () => {
    render(<MessageInput onSend={vi.fn()} isPending={false} />);
    expect(getTextarea()).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar mensaje')).toBeInTheDocument();
  });

  it('does not render keyboard hint in dock variant', () => {
    render(<MessageInput onSend={vi.fn()} isPending={false} variant="dock" />);
    expect(screen.queryByText('para enviar')).not.toBeInTheDocument();
  });

  it('renders keyboard hint in hero variant', () => {
    render(<MessageInput onSend={vi.fn()} isPending={false} variant="hero" />);
    expect(screen.getByText('para enviar')).toBeInTheDocument();
    expect(screen.getByText('para nueva línea')).toBeInTheDocument();
  });

  it('submits on Enter without Shift', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} isPending={false} />);
    await userEvent.type(getTextarea(), 'hola{Enter}');
    expect(onSend).toHaveBeenCalledWith('hola');
  });

  it('keeps newline when Enter is pressed with Shift', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} isPending={false} />);
    const textarea = getTextarea();
    await userEvent.type(textarea, 'a{Shift>}{Enter}{/Shift}b');
    expect(onSend).not.toHaveBeenCalled();
    expect(textarea.value).toBe('a\nb');
  });

  it('disables send button when textarea is empty', () => {
    render(<MessageInput onSend={vi.fn()} isPending={false} />);
    expect(screen.getByLabelText('Enviar mensaje')).toBeDisabled();
  });

  it('exposes setValue via imperative handle that updates the textarea', () => {
    const ref = createRef<MessageInputHandle>();
    render(<MessageInput ref={ref} onSend={vi.fn()} isPending={false} />);
    act(() => {
      ref.current?.setValue('texto inyectado');
    });
    expect(getTextarea().value).toBe('texto inyectado');
  });

  it('clears textarea after a successful send', async () => {
    render(<MessageInput onSend={vi.fn()} isPending={false} />);
    const textarea = getTextarea();
    await userEvent.type(textarea, 'mensaje{Enter}');
    expect(textarea.value).toBe('');
  });
});
