import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'id'];
export const defaultLocale = 'en';

export default getRequestConfig(async () => {
  // Read locale from cookie. If not present, default to English.
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  const locale = localeCookie && locales.includes(localeCookie) ? localeCookie : defaultLocale;

  let messages;
  if (locale === 'id') {
    messages = (await import('../messages/id.json')).default;
  } else {
    messages = (await import('../messages/en.json')).default;
  }

  return {
    locale,
    messages
  };
});
