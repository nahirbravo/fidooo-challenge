'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { ForgotSchema, type ForgotFormValues } from '../schemas';
import { AuthFieldError } from './AuthFieldError';
import { feedback } from '@/lib/feedback';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(ForgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    await resetPassword(data.email);
    setSent(true);
    feedback.success(t('toast.resetEmailSent'));
  };

  if (sent) {
    return (
      <div className="auth-form auth-form-confirm">
        <p className="auth-confirm-message">
          {t('auth.forgotPassword.success')}
        </p>
        <div className="auth-link-group">
          <Link href={'/login'} className="auth-link auth-link-primary">
            {t('auth.forgotPassword.backLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-field">
        <label htmlFor="forgot-email" className="auth-label">
          {t('field.email')}
        </label>
        <div className="auth-input-wrap">
          <Mail
            aria-hidden="true"
            className="auth-input-icon"
            strokeWidth={1.5}
          />
          <Input
            id="forgot-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('placeholder.email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            className="auth-input"
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <AuthFieldError
            id="forgot-email-error"
            message={t(errors.email.message ?? 'validation.required')}
          />
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="auth-submit"
        isLoading={isSubmitting}
      >
        <span>{t('auth.forgotPassword.submit')}</span>
        {!isSubmitting ? (
          <ArrowRight
            aria-hidden="true"
            className="ml-1 size-4 transition-transform group-hover/button:translate-x-0.5"
            strokeWidth={1.7}
          />
        ) : null}
      </Button>

      <div className="auth-link-group">
        <Link href={'/login'} className="auth-link">
          {t('auth.forgotPassword.backLink')}
        </Link>
      </div>
    </form>
  );
}

ForgotPasswordForm.displayName = 'ForgotPasswordForm';
