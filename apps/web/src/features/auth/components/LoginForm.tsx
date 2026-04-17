'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth, AuthServiceError } from '../hooks/useAuth';
import { LoginSchema, type LoginFormValues } from '../schemas';
import { AuthFieldError } from './AuthFieldError';
import { feedback } from '@/lib/feedback';
import { useAuthStore } from '@/stores';

export function LoginForm() {
  const t = useTranslations();
  const { signIn } = useAuth();
  const lastEmail = useAuthStore((s) => s.lastEmail);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: lastEmail, password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      const key =
        error instanceof AuthServiceError ? error.i18nKey : 'errors.generic';
      feedback.error(t(key));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-field">
        <label htmlFor="login-email" className="auth-label">
          {t('field.email')}
        </label>
        <div className="auth-input-wrap">
          <Mail
            aria-hidden="true"
            className="auth-input-icon"
            strokeWidth={1.5}
          />
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('placeholder.email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className="auth-input"
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <AuthFieldError
            id="login-email-error"
            message={t(errors.email.message ?? 'validation.required')}
          />
        ) : null}
      </div>

      <div className="auth-field">
        <label htmlFor="login-password" className="auth-label">
          {t('field.password')}
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder={t('placeholder.password')}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
          {...register('password')}
        />
        {errors.password ? (
          <AuthFieldError
            id="login-password-error"
            message={t(errors.password.message ?? 'validation.required')}
          />
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="auth-submit"
        isLoading={isSubmitting}
      >
        <span>{t('auth.login.submit')}</span>
        {!isSubmitting ? (
          <ArrowRight
            aria-hidden="true"
            className="ml-1 size-4 transition-transform group-hover/button:translate-x-0.5"
            strokeWidth={1.7}
          />
        ) : null}
      </Button>

      <div className="auth-link-group">
        <Link href={'/forgot-password'} className="auth-link">
          {t('auth.login.forgotLink')}
        </Link>
        <Link href={'/register'} className="auth-link auth-link-primary">
          {t('auth.login.registerLink')}
        </Link>
      </div>
    </form>
  );
}

LoginForm.displayName = 'LoginForm';
