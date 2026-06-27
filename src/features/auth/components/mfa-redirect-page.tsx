'use client'

import { useRouter } from 'next/navigation'
import { MfaChallenge } from '@/features/auth/components/mfa-challenge'

export function MfaRedirectPage({
  factors,
  redirectTo,
}: {
  factors: { id: string; type: string; friendly_name?: string | null }[]
  redirectTo: string
}) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <MfaChallenge factors={factors} onComplete={() => router.push(redirectTo)} />
    </div>
  )
}
