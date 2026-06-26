'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Input, Text, Stack } from 'azimuth-ui'
import styles from './mfa-panel.module.css'
import { removeMfa } from './mfa'

interface MfaFactor {
  id: string
  type: string
  created_at: string
  friendly_name?: string | null
}

function PasskeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function MfaPanel({ factors }: { factors: MfaFactor[] }) {
  const [enrolling, setEnrolling] = useState<'totp' | 'webauthn' | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [friendlyName, setFriendlyName] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  async function startTotpEnroll() {
    setEnrolling('totp')
    const res = await fetch('/api/auth/mfa/enroll', {
      method: 'POST',
      body: JSON.stringify({ factorType: 'totp', friendlyName: friendlyName || undefined }),
    })
    const data = await res.json()
    if (data.qr) {
      setQrCode(data.qr)
      setSecret(data.secret ?? '')
      setFactorId(data.id)
    }
  }

  async function startWebauthnEnroll() {
    setEnrolling('webauthn')
    const res = await fetch('/api/auth/mfa/enroll', {
      method: 'POST',
      body: JSON.stringify({ factorType: 'webauthn', friendlyName: friendlyName || undefined }),
    })
    const data = await res.json()
    if (data.webauthn) {
      setFactorId(data.id)
      try {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: Uint8Array.from(atob(data.webauthn.challenge), (c) => c.charCodeAt(0)),
            rp: data.webauthn.rp,
            user: {
              id: Uint8Array.from(atob(data.webauthn.user.id), (c) => c.charCodeAt(0)),
              name: data.webauthn.user.name,
              displayName: data.webauthn.user.display_name,
            },
            pubKeyCredParams: data.webauthn.pub_key_cred_params,
            timeout: 60000,
            attestation: 'none',
          },
        })
        if (credential) {
          const code = (credential as { id: string }).id
          await fetch('/api/auth/mfa/verify', {
            method: 'POST',
            body: JSON.stringify({ factorId: data.id, code }),
          })
          window.location.reload()
        }
      } catch {
        setEnrolling(null)
      }
    }
  }

  async function completeTotpEnroll() {
    await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, code: verifyCode }),
    })
    setEnrolling(null)
    window.location.reload()
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    await removeMfa(id)
    window.location.reload()
  }

  function resetEnroll() {
    setEnrolling(null)
    setQrCode('')
    setSecret('')
    setFactorId('')
    setVerifyCode('')
    setFriendlyName('')
  }

  return (
    <Stack spacing="md">
      {factors.length > 0 ? (
        <Stack spacing="xs">
          {factors.map((f) => (
            <div key={f.id} className={styles.factorRow}>
              <div style={{ flex: 1 }}>
                <Text element={{ size: 'sm' }} weight="semibold">
                  {f.friendly_name || (f.type === 'webauthn' ? 'Passkey' : f.type.toUpperCase())}
                </Text>
                <Text element={{ size: 'xs' }} color="secondary">
                  Added {new Date(f.created_at).toLocaleDateString()}
                </Text>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(f.id)}
                disabled={removing === f.id}
              >
                {removing === f.id ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          ))}
        </Stack>
      ) : (
        <Text element={{ size: 'sm' }} color="secondary">
          No 2FA methods configured.
        </Text>
      )}
      {enrolling === 'totp' ? (
        <Stack spacing="sm">
          <Text element={{ size: 'sm' }} weight="semibold">
            Option 1: Scan QR Code
          </Text>
          <Text element={{ size: 'xs' }}>
            Scan with your authenticator app (Google Authenticator, 1Password, etc.)
          </Text>
          {qrCode && (
            <Image
              src={qrCode}
              alt="TOTP QR Code"
              width={200}
              height={200}
              className={styles.qrCode}
              unoptimized
            />
          )}
          <Text element={{ size: 'sm' }} weight="semibold">
            Option 2: Enter Setup Key
          </Text>
          <Text element={{ size: 'xs' }}>
            Can&apos;t scan the QR? Enter this key manually in your authenticator app:
          </Text>
          <Text className={styles.secretKey}>{secret}</Text>
          <Input
            label={{ text: 'Verification Code' }}
            value={{
              value: verifyCode,
              onChange: (e) => setVerifyCode(e.target.value),
            }}
            placeholder="6-digit code from authenticator"
          />
          <div style={{ display: 'flex', gap: 'var(--azimuth-space-sm)' }}>
            <Button variant="primary" onClick={completeTotpEnroll}>
              Verify & Enable
            </Button>
            <Button variant="tertiary" onClick={resetEnroll}>
              Cancel
            </Button>
          </div>
        </Stack>
      ) : enrolling === 'webauthn' ? (
        <Stack spacing="sm">
          <Text>Setting up passkey...</Text>
        </Stack>
      ) : (
        <Stack spacing="sm">
          <Input
            label={{ text: 'Device name (optional)' }}
            name="friendlyName"
            value={{ value: friendlyName, onChange: (e) => setFriendlyName(e.target.value) }}
            placeholder="e.g. My iPhone, Work Laptop"
          />
          <Button variant="primary" onClick={startTotpEnroll}>
            Set up Authenticator App
          </Button>
          <Button variant="tertiary" onClick={startWebauthnEnroll}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PasskeyIcon /> Add Passkey
            </span>
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
