'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  const t = useTranslations();

  if (!isVisible) return null;

  return (
    <div className="chat-typing" role="status" aria-label={t('chat.typing')}>
      <div className="chat-typing-bubble">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'chat-typing-dot',
                'motion-safe:animate-bounce',
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
      <span className="chat-typing-label">
        {t('chat.typing')}
      </span>
    </div>
  );
}

TypingIndicator.displayName = 'TypingIndicator';
