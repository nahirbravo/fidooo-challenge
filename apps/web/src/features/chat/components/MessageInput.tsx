'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MAX_MESSAGE_LENGTH } from '@fidooo/shared';

export interface MessageInputHandle {
  setValue: (text: string) => void;
}

interface MessageInputProps {
  onSend: (message: string) => void;
  isPending: boolean;
  isDisabled?: boolean;
  variant?: 'dock' | 'hero';
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  function MessageInput({ onSend, isPending, isDisabled = false, variant = 'dock' }, ref) {
    const t = useTranslations();
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, []);

    const handleSend = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed || isPending || isDisabled) return;
      onSend(trimmed);
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, [value, isDisabled, isPending, onSend]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend],
    );

    useImperativeHandle(
      ref,
      () => ({
        setValue: (text: string) => {
          setValue(text);
          requestAnimationFrame(() => {
            const node = textareaRef.current;
            if (!node) return;
            node.focus();
            node.selectionStart = node.selectionEnd = node.value.length;
            adjustHeight();
          });
        },
      }),
      [adjustHeight],
    );

    const charCount = value.length;
    const isOverLimit = charCount > MAX_MESSAGE_LENGTH;
    const isEmpty = value.trim().length === 0;
    const isHero = variant === 'hero';

    return (
      <div className={cn('chat-composer', `chat-composer-${variant}`)}>
        <div className="chat-composer-inner">
          <div className="chat-textarea-wrap">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.inputPlaceholder')}
              aria-label={t('chat.inputPlaceholder')}
              rows={1}
              className={cn(
                'chat-textarea',
                isOverLimit && 'border-destructive focus:ring-destructive/50',
              )}
              disabled={isPending || isDisabled}
            />
            {charCount > MAX_MESSAGE_LENGTH * 0.8 ? (
              <span
                className={cn(
                  'chat-counter',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground/50',
                )}
              >
                {t('chat.charCount', {
                  count: charCount,
                  max: MAX_MESSAGE_LENGTH,
                })}
              </span>
            ) : null}
          </div>
          <div className="chat-composer-actions">
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isEmpty || isOverLimit || isPending || isDisabled}
              isLoading={isPending}
              aria-label={t('chat.send')}
              className="chat-send-button shrink-0"
            >
              {!isPending ? (
                <Send className="size-4" strokeWidth={1.8} />
              ) : null}
            </Button>
          </div>
        </div>
        {isHero ? (
          <p className="chat-composer-hint">
            <span className="chat-composer-hint-item">
              <kbd>Enter</kbd>
              <span>{t('chat.kbd.send')}</span>
            </span>
            <span className="chat-composer-hint-sep" aria-hidden="true">
              ·
            </span>
            <span className="chat-composer-hint-item">
              <span className="chat-composer-hint-combo">
                <kbd>Shift</kbd>
                <span aria-hidden="true">+</span>
                <kbd>Enter</kbd>
              </span>
              <span>{t('chat.kbd.newline')}</span>
            </span>
          </p>
        ) : null}
      </div>
    );
  },
);
