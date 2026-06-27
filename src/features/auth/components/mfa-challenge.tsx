'use client'

import { useState } from 'react'
import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { verifyMfa } from '@/features/auth/mfa'
import styles from './mfa-challenge.module.css'

interface MfaFactor {
  id: string
  type: string
  friendly_name?: string | null
}

interface MfaChallengeProps {
  factors: MfaFactor[]
  onComplete: () => void
}

export function MfaChallenge({ factors, onComplete }: MfaChallengeProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totpFactor = factors.find((f) => f.type === 'totp')
  const webauthnFactor = factors.find((f) => f.type === 'webauthn')

  async function handleTotp() {
    if (!totpFactor || !code) return
    setLoading(true)
    setError('')
    const result = await verifyMfa(totpFactor.id, code)
    if ('error' in result) {
      setError(result.error ?? 'Verification failed')
    } else {
      onComplete()
    }
    setLoading(false)
  }

  async function handleWebauthn() {
    if (!webauthnFactor) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/mfa/challenge', {
        method: 'POST',
        body: JSON.stringify({ factorId: webauthnFactor.id }),
      })
      if (!res.ok) throw new Error('Challenge failed')
      const data = await res.json()

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(
            atob(data.challenge.replace(/-/g, '+').replace(/_/g, '/')),
            (c) => c.charCodeAt(0),
          ),
          rpId: window.location.hostname,
          allowCredentials: data.allow_credentials?.map((c: { id: string }) => ({
            id: Uint8Array.from(
              atob(c.id.replace(/-/g, '+').replace(/_/g, '/')),
              (c2) => c2.charCodeAt(0),
            ),
            type: 'public-key' as const,
          })) ?? [],
          timeout: 60000,
          userVerification: 'required' as const,
        },
      })

      if (credential) {
        const result = await verifyMfa(webauthnFactor.id, credential.id)
        if ('error' in result) {
          setError(result.error ?? 'Verification failed')
        } else {
          onComplete()
        }
      }
    } catch {
      setError('Passkey verification failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <Card className={styles.card}>
      <Stack spacing="md" style={{ textAlign: 'center' }}>
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Two-Factor Authentication
        </Text>
        <Text element={{ size: 'sm' }} color="secondary">
          {totpFactor && webauthnFactor
            ? 'Enter the code from your authenticator app or use your passkey.'
            : totpFactor
              ? 'Enter the 6-digit code from your authenticator app.'
              : 'Verify with your passkey to continue.'}
        </Text>

        {totpFactor && (
          <Stack spacing="sm" style={{ textAlign: 'left' }}>
            <Input
              label={{ text: 'Verification Code' }}
              name="code"
              value={{ value: code, onChange: (e) => setCode(e.target.value) }}
              placeholder="000000"
            />
            <Button variant="primary" onClick={handleTotp} disabled={loading || !code}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Stack>
        )}

        {totpFactor && webauthnFactor && (
          <Text element={{ size: 'sm' }} color="secondary">
            — or —
          </Text>
        )}

        {webauthnFactor && (
          <Button variant="tertiary" onClick={handleWebauthn} disabled={loading}>
            {loading ? 'Verifying...' : 'Use Passkey'}
          </Button>
        )}

        {error && (
          <div role="alert">
            <Text element={{ size: 'sm' }}>{error}</Text>
          </div>
        )}
      </Stack>
    </Card>
  )
}
