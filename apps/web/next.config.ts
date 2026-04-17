import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isProduction = process.env['NODE_ENV'] === 'production';
const apiOrigin = (() => {
  const rawApiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

  try {
    return new URL(rawApiUrl).origin;
  } catch {
    return 'http://localhost:4000';
  }
})();

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      isProduction
        ? "script-src 'self' 'unsafe-inline' https://apis.google.com"
        : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com ${apiOrigin}`,
      'frame-src https://*.firebaseapp.com',
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
