'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface NewMessagesButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function NewMessagesButton({ isVisible, onClick }: NewMessagesButtonProps) {
  const t = useTranslations();

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[var(--z-sticky)]">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        className="chat-new-button gap-1"
      >
        <ChevronDown className="size-3.5" strokeWidth={1.5} />
        {t('chat.newMessages')}
      </Button>
    </div>
  );
}

NewMessagesButton.displayName = 'NewMessagesButton';
