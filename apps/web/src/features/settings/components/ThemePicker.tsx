'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { feedback } from '@/lib/feedback';

type ThemeValue = 'light' | 'dark' | 'system';

export function ThemePicker() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const lastRequestedThemeRef = useRef<ThemeValue | null>(null);
  const selectedTheme = (theme as ThemeValue | undefined) ?? 'system';

  const options: Array<{
    value: ThemeValue;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      value: 'light',
      label: t('theme.light'),
      icon: <Sun className="size-3" strokeWidth={1.6} aria-hidden="true" />,
    },
    {
      value: 'dark',
      label: t('theme.dark'),
      icon: <Moon className="size-3" strokeWidth={1.6} aria-hidden="true" />,
    },
    {
      value: 'system',
      label: t('theme.system'),
      icon: <Monitor className="size-3" strokeWidth={1.6} aria-hidden="true" />,
    },
  ];

  const handleChange = (value: ThemeValue) => {
    if (value === selectedTheme || value === lastRequestedThemeRef.current) {
      return;
    }
    lastRequestedThemeRef.current = value;
    setTheme(value);
    feedback.confirm(t('toast.themeChanged'));
  };

  return (
    <SegmentedControl
      options={options}
      value={selectedTheme}
      onValueChange={handleChange}
      size="sm"
      className="w-full"
    />
  );
}

ThemePicker.displayName = 'ThemePicker';
