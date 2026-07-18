'use server'

import { cookies } from 'next/headers'
import { isLocale } from '@/i18n/locales'

/**
 * Persist the viewer's language choice. Read server-side in i18n/request.ts;
 * a preference cookie, not an auth credential.
 */
export async function setLocale(next: string): Promise<void> {
  if (!isLocale(next)) return
  const cookieStore = await cookies()
  cookieStore.set('locale', next, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
