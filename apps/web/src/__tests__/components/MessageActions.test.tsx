import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageActions } from '@/features/chat/components/MessageActions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'chat.copy': 'Copy',
      'chat.copied': 'Copied',
      'chat.retry': 'Retry',
      'chat.actions.label': 'Message actions',
      'common.dismiss': 'Dismiss',
    };
    return map[key] ?? key;
  },
}));

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText },
  });
  writeText.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MessageActions', () => {
  it('renders the copy button for assistant messages', () => {
    render(
      <MessageActions
        messageId="m1"
        content="hello"
        timestamp={Date.now()}
        align="start"
      />,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders the copy button for user messages (always copyable)', () => {
    render(
      <MessageActions
        messageId="m1"
        content="hello"
        timestamp={Date.now()}
        align="end"
      />,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('copies the content to the clipboard and updates the label', async () => {
    render(
      <MessageActions
        messageId="m1"
        content="hello there"
        timestamp={Date.now()}
        align="end"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('hello there');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copied' }),
      ).toBeInTheDocument();
    });
  });

  it('shows retry and dismiss buttons when status is error', async () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <MessageActions
        messageId="m1"
        content="oops"
        timestamp={Date.now()}
        align="end"
        status="error"
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    const retryBtn = screen.getByRole('button', { name: 'Retry' });
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' });

    await userEvent.click(retryBtn);
    await userEvent.click(dismissBtn);

    expect(onRetry).toHaveBeenCalledWith('m1', 'oops');
    expect(onDismiss).toHaveBeenCalledWith('m1');
  });

  it('disables the copy button while sending', () => {
    render(
      <MessageActions
        messageId="m1"
        content="pending"
        timestamp={Date.now()}
        align="end"
        status="sending"
      />,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });

  it('renders a formatted timestamp', () => {
    render(
      <MessageActions
        messageId="m1"
        content="hi"
        timestamp={new Date('2026-04-16T15:30:00').getTime()}
        align="end"
      />,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.textContent).toMatch(/\d{1,2}:\d{2}/);
  });
});
