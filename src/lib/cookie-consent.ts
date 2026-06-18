const CONSENT_COOKIE = 'cookie-consent'
const ACCEPTED_VALUE = 'accepted'
const DECLINED_VALUE = 'declined'

export function hasCookieConsent(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith(`${CONSENT_COOKIE}=${ACCEPTED_VALUE}`))
}

export function hasDeclinedConsent(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith(`${CONSENT_COOKIE}=${DECLINED_VALUE}`))
}

export function setCookieConsent(accepted: boolean): void {
  const value = accepted ? ACCEPTED_VALUE : DECLINED_VALUE
  document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
}
