'use client';

import { useTranslations } from 'next-intl';
import { Check, Copy, RotateCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/lib/use-clipboard';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  messageId: string;
  content: string;
  timestamp: number;
  align: 'start' | 'end';
  status?: 'sending' | 'sent' | 'error';
  onRetry?: (id: string, content: string) => void;
  onDismiss?: (id: string) => void;
}

function formatHoverTimestamp(ms: number): string {
  if (!ms) return '';
  const date = new Date(ms);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function MessageActions({
  messageId,
  content,
  timestamp,
  align,
  status,
  onRetry,
  onDismiss,
}: MessageActionsProps) {
  const t = useTranslations();
  const { copied, copy } = useClipboard();

  const isError = status === 'error';
  const isSending = status === 'sending';
  const formattedTime = formatHoverTimestamp(timestamp);

  return (
    <div
      className={cn(
        'chat-actions',
        align === 'end' ? 'chat-actions-end' : 'chat-actions-start',
        isError && 'chat-actions-visible',
      )}
      role="toolbar"
      aria-label={t('chat.actions.label')}
    >
      {formattedTime ? (
        <span className="chat-actions-time" aria-hidden="true">
          {formattedTime}
        </span>
      ) : null}

      {isError && onRetry ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="chat-actions-button"
          onClick={() => onRetry(messageId, content)}
          aria-label={t('chat.retry')}
        >
          <RotateCw className="size-3.5" strokeWidth={1.6} />
        </Button>
      ) : null}

      {isError && onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="chat-actions-button"
          onClick={() => onDismiss(messageId)}
          aria-label={t('common.dismiss')}
        >
          <X className="size-3.5" strokeWidth={1.6} />
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="chat-actions-button"
        onClick={() => {
          void copy(content);
        }}
        disabled={isSending || !content}
        aria-label={copied ? t('chat.copied') : t('chat.copy')}
      >
        {copied ? (
          <Check className="size-3.5" strokeWidth={1.6} />
        ) : (
          <Copy className="size-3.5" strokeWidth={1.6} />
        )}
      </Button>

      <span className="sr-only" aria-live="polite">
        {copied ? t('chat.copied') : ''}
      </span>
    </div>
  );
}

MessageActions.displayName = 'MessageActions';
