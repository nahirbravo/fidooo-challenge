'use client';

import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
} from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type InputProps = ComponentPropsWithoutRef<typeof Input>;

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Hide the leading lock icon (e.g. when used outside auth surface). */
  hideLockIcon?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, hideLockIcon = false, ...props },
    ref,
  ) {
    const t = useTranslations();
    const [shown, setShown] = useState(false);

    return (
      <div className="auth-input-wrap">
        {!hideLockIcon ? (
          <LockKeyhole
            aria-hidden="true"
            className="auth-input-icon"
            strokeWidth={1.5}
          />
        ) : null}
        <Input
          ref={ref}
          type={shown ? 'text' : 'password'}
          className={cn('auth-input auth-input-with-toggle', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={
            shown ? t('field.hidePassword') : t('field.showPassword')
          }
          aria-pressed={shown}
          className="auth-input-toggle"
        >
          {shown ? (
            <EyeOff
              className="size-3.5"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          ) : (
            <Eye
              className="size-3.5"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    );
  },
);
