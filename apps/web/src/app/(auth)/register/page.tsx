import { useTranslations } from 'next-intl';
import { AuthFormLayout } from '@/components/layout/AuthFormLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  const t = useTranslations();

  return (
    <AuthFormLayout title={t('auth.register.title')}>
      <RegisterForm />
    </AuthFormLayout>
  );
}
