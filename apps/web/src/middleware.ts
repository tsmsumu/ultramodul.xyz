import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never' // Membuat URL tetap bersih tersembunyi
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
