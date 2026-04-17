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
import { RegisterSchema, type RegisterFormValues } from '../schemas';
import { AuthFieldError } from './AuthFieldError';
import { feedback } from '@/lib/feedback';

export function RegisterForm() {
  const t = useTranslations();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signUp(data.email, data.password);
    } catch (error) {
      const key =
        error instanceof AuthServiceError ? error.i18nKey : 'errors.generic';
      feedback.error(t(key));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-field">
        <label htmlFor="reg-email" className="auth-label">
          {t('field.email')}
        </label>
        <div className="auth-input-wrap">
          <Mail
            aria-hidden="true"
            className="auth-input-icon"
            strokeWidth={1.5}
          />
          <Input
            id="reg-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('placeholder.email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            className="auth-input"
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <AuthFieldError
            id="reg-email-error"
            message={t(errors.email.message ?? 'validation.required')}
          />
        ) : null}
      </div>

      <div className="auth-field">
        <label htmlFor="reg-password" className="auth-label">
          {t('field.password')}
        </label>
        <PasswordInput
          id="reg-password"
          autoComplete="new-password"
          placeholder={t('placeholder.password')}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? 'reg-password-error' : 'reg-password-hint'
          }
          {...register('password')}
        />
        {errors.password ? (
          <AuthFieldError
            id="reg-password-error"
            message={t(errors.password.message ?? 'validation.required')}
          />
        ) : (
          <p id="reg-password-hint" className="auth-hint">
            {t('auth.register.passwordHint')}
          </p>
        )}
      </div>

      <div className="auth-field">
        <label htmlFor="reg-confirm" className="auth-label">
          {t('field.confirmPassword')}
        </label>
        <PasswordInput
          id="reg-confirm"
          autoComplete="new-password"
          placeholder={t('placeholder.password')}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? 'reg-confirm-error' : undefined
          }
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <AuthFieldError
            id="reg-confirm-error"
            message={t(errors.confirmPassword.message ?? 'validation.required')}
          />
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="auth-submit"
        isLoading={isSubmitting}
      >
        <span>{t('auth.register.submit')}</span>
        {!isSubmitting ? (
          <ArrowRight
            aria-hidden="true"
            className="ml-1 size-4 transition-transform group-hover/button:translate-x-0.5"
            strokeWidth={1.7}
          />
        ) : null}
      </Button>

      <div className="auth-link-group">
        <Link href={'/login'} className="auth-link auth-link-primary">
          {t('auth.register.loginLink')}
        </Link>
      </div>
    </form>
  );
}

RegisterForm.displayName = 'RegisterForm';
