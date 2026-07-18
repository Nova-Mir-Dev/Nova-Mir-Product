export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string | undefined): value is Locale {
  return value ? (locales as readonly string[]).includes(value) : false
}
