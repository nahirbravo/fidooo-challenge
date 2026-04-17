import { useTranslations } from 'next-intl';
import { AuthFormLayout } from '@/components/layout/AuthFormLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const t = useTranslations();

  return (
    <AuthFormLayout title={t('auth.forgotPassword.title')}>
      <ForgotPasswordForm />
    </AuthFormLayout>
  );
}
