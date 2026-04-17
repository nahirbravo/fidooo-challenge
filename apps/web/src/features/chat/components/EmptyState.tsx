'use client';

import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations();

  return (
    <div className="chat-empty">
      <h2 className="chat-empty-title">
        {t('chat.emptyTitle')}
      </h2>
      <p className="chat-empty-subtitle">
        {t('chat.emptySubtitle')}
      </p>
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
