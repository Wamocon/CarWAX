import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import en from '../messages/en.json';
import ru from '../messages/ru.json';
import tr from '../messages/tr.json';

// Statische Imports statt `import(`../messages/${locale}.json`)` — sonst läuft der
// Turbopack-Dev-Server in seine Race-Condition beim parallelen JSON-Compile.
const MESSAGES = { en, ru, tr } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale as keyof typeof MESSAGES] ?? MESSAGES.tr,
  };
});
