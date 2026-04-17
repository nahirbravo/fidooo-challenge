'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { feedback } from '@/lib/feedback';

type LocaleValue = 'es' | 'en';
const PENDING_LANGUAGE_TOAST_KEY = 'pending-language-toast-locale';

function isLocaleValue(value: string | null): value is LocaleValue {
  return value === 'es' || value === 'en';
}

function setLocaleCookie(locale: string): void {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

function setPendingLanguageToast(locale: LocaleValue): void {
  window.sessionStorage.setItem(PENDING_LANGUAGE_TOAST_KEY, locale);
}

function consumePendingLanguageToast(locale: string): boolean {
  const pendingLocale = window.sessionStorage.getItem(PENDING_LANGUAGE_TOAST_KEY);
  if (!isLocaleValue(pendingLocale) || pendingLocale !== locale) {
    return false;
  }
  window.sessionStorage.removeItem(PENDING_LANGUAGE_TOAST_KEY);
  return true;
}

export function LanguagePicker() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!consumePendingLanguageToast(locale)) return;
    feedback.confirm(t('toast.languageChanged'));
  }, [locale, t]);

  const options: Array<{ value: LocaleValue; label: string }> = [
    { value: 'es', label: t('language.es') },
    { value: 'en', label: t('language.en') },
  ];

  const handleChange = (value: LocaleValue) => {
    if (value === locale) return;
    setLocaleCookie(value);
    setPendingLanguageToast(value);
    router.refresh();
  };

  return (
    <SegmentedControl
      options={options}
      value={locale as LocaleValue}
      onValueChange={handleChange}
      size="sm"
      className="w-full"
    />
  );
}

LanguagePicker.displayName = 'LanguagePicker';
