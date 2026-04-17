import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['es', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: SupportedLocale = 'es';

function isSupported(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = cookieLocale && isSupported(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    timeZone: 'UTC',
    messages: (
      await import(`../../messages/${locale}.json`)
    ).default as Record<string, unknown>,
  };
});

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale };
