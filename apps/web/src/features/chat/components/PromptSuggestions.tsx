'use client';

import { useTranslations } from 'next-intl';
import { Code, Lightbulb, FileText, MessageCircleQuestion, type LucideIcon } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelect: (text: string) => void;
}

const PROMPTS: ReadonlyArray<{ key: string; icon: LucideIcon }> = [
  { key: 'code', icon: Code },
  { key: 'explain', icon: Lightbulb },
  { key: 'write', icon: FileText },
  { key: 'solve', icon: MessageCircleQuestion },
];

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  const t = useTranslations();

  return (
    <div className="chat-prompts" role="list">
      {PROMPTS.map(({ key, icon: Icon }) => (
        <button
          key={key}
          type="button"
          role="listitem"
          className="chat-prompt-card"
          onClick={() => onSelect(t(`chat.prompts.${key}.text`))}
        >
          <span className="chat-prompt-card-icon" aria-hidden="true">
            <Icon className="size-3.5" strokeWidth={1.8} />
          </span>
          <span className="chat-prompt-card-text">
            <span className="chat-prompt-card-title">
              {t(`chat.prompts.${key}.title`)}
            </span>
            <span className="chat-prompt-card-hint">
              {t(`chat.prompts.${key}.hint`)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

PromptSuggestions.displayName = 'PromptSuggestions';
