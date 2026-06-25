import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { cookies, headers } from 'next/headers'
import en from '../messages/en.json'
import es from '../messages/es.json'

export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
const DEFAULT_LOCALE: Locale = 'en'

const messageMap: Record<Locale, AbstractIntlMessages> = {
  en,
  es,
}

function isLocale(value: string | undefined): value is Locale {
  return value ? (locales as readonly string[]).includes(value) : false
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