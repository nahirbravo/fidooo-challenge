import { useTranslations } from 'next-intl';
import { AuthFormLayout } from '@/components/layout/AuthFormLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  const t = useTranslations();

  return (
    <AuthFormLayout title={t('auth.login.title')}>
      <LoginForm />
    </AuthFormLayout>
  );
}
