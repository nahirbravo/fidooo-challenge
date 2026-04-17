'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

const FEATURE_KEYS = ['speed', 'context', 'audience'] as const;

export function AuthSidePanel() {
  const t = useTranslations();

  return (
    <aside className="auth-side" aria-hidden="true">
      <div className="auth-side-inner">
        <span className="auth-side-brand">{t('common.navBrand')}</span>

        <div className="auth-side-content">
          <h2 className="auth-side-title">{t('auth.tagline.title')}</h2>
          <p className="auth-side-subtitle">{t('auth.tagline.subtitle')}</p>
        </div>

        <ul className="auth-side-features">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="auth-side-feature">
              <span className="auth-side-feature-icon">
                <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <span>{t(`auth.features.${key}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

AuthSidePanel.displayName = 'AuthSidePanel';
