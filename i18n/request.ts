import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { cookies, headers } from 'next/headers'
import en from '../messages/en.json'
import es from '../messages/es.json'
import ru from '../messages/ru.json'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

export { locales, type Locale } from './locales'

const messageMap: Record<Locale, AbstractIntlMessages> = {
  en,
  es,
  ru,
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerList = await headers()

  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerList
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0]

  const locale: Locale =
    (isLocale(cookieLocale) && cookieLocale) ||
    (isLocale(acceptLang) && acceptLang) ||
    DEFAULT_LOCALE

  return { locale, messages: messageMap[locale] }
})
