import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8">
      <span className="text-6xl font-heading font-bold text-muted-foreground/30">404</span>
      <h1 className="text-xl font-heading font-semibold">{t('errors.notFound')}</h1>
      <Link href="/">
        <Button variant="outline">{t('errors.goHome')}</Button>
      </Link>
    </div>
  );
}
