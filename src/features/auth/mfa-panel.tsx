'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Input, Text, Stack } from 'azimuth-ui'
import styles from './mfa-panel.module.css'
import { removeMfa, sendReauthCode, type StepUp } from './mfa'

interface MfaFactor {
  id: string
  type: string
  created_at: string
  friendly_name?: string | null
}

type Pending = { kind: 'totp' | 'webauthn' | 'remove'; factorId?: string }

function PasskeyIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function MfaPanel({
  factors,
  stepUpMode,
}: {
  factors: MfaFactor[]
  // 'unavailable' gates enroll/remove when no secure step-up channel exists
  // (e.g. magic-link clients on a Supabase plan that can't email a re-auth code).
  stepUpMode: 'password' | 'email' | 'unavailable'
}) {
  if (stepUpMode === 'unavailable') {
    return (
      <Stack spacing="md">
        {factors.length > 0 ? (
          <Stack spacing="xs">
            {factors.map((f) => (
              <div key={f.id} className={styles.factorRow}>
                <div style={{ flex: 1 }}>
                  <Text element={{ size: 'sm' }} weight="semibold">
                    {f.friendly_name ||
                      (f.type === 'webauthn'
                        ? 'Passkey'
                        : f.type.toUpperCase())}
                  </Text>
                  <Text element={{ size: 'xs' }} color="secondary">
                    Added {new Date(f.created_at).toLocaleDateString('en-US')}
                  </Text>
                </div>
              </div>
            ))}
          </Stack>
        ) : (
          <Text element={{ size: 'sm' }} color="secondary">
            No 2FA methods configured.
          </Text>
        )}
        <Text element={{ size: 'sm' }} color="secondary">
          Two-factor setup for client accounts is coming soon.
        </Text>
      </Stack>
    )
  }

  return <MfaManager factors={factors} stepUpMode={stepUpMode} />
}

function MfaManager({
  factors,
  stepUpMode,
}: {
  factors: MfaFactor[]
  stepUpMode: 'password' | 'email'
}) {
  const [enrolling, setEnrolling] = useState<'totp' | 'webauthn' | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [friendlyName, setFriendlyName] = useState('')

  const [pending, setPending] = useState<Pending | null>(null)
  const [password, setPassword] = useState('')
  const [emailToken, setEmailToken] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [stepUpError, setStepUpError] = useState('')
  const [stepUpBusy, setStepUpBusy] = useState(false)

  function beginStepUp(kind: Pending['kind'], id?: string) {
    setPending({ kind, factorId: id })
    setPassword('')
    setEmailToken('')
    setCodeSent(false)
    setStepUpError('')
    if (stepUpMode === 'email') {
      void sendReauthCode().then((r) => {
        if ('error' in r) setStepUpError(r.error ?? 'Failed to send code.')
        else setCodeSent(true)
      })
    }
  }

  function cancelStepUp() {
    setPending(null)
    setStepUpError('')
    setStepUpBusy(false)
  }

  function currentCredential(): StepUp | null {
    if (stepUpMode === 'password')
      return password ? { method: 'password', password } : null
    return emailToken ? { method: 'email', token: emailToken } : null
  }

  async function confirmStepUp() {
    const cred = currentCredential()
    if (!cred) {
      setStepUpError(
        stepUpMode === 'password'
          ? 'Enter your password.'
          : 'Enter the code we emailed you.',
      )
      return
    }
    setStepUpBusy(true)
    setStepUpError('')
    const p = pending!

    if (p.kind === 'remove') {
      const r = await removeMfa(p.factorId!, cred)
      if (r && 'error' in r && r.error) {
        setStepUpError(r.error)
        setStepUpBusy(false)
        return
      }
      window.location.reload()
      return
    }

    const res = await fetch('/api/auth/mfa/enroll', {
      method: 'POST',
      body: JSON.stringify({
        factorType: p.kind,
        friendlyName: friendlyName || undefined,
        stepUp: cred,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setStepUpError(data.error ?? 'Verification failed.')
      setStepUpBusy(false)
      return
    }

    setPending(null)
    setStepUpBusy(false)

    if (p.kind === 'totp') {
      setEnrolling('totp')
      if (data.qr) {
        setQrCode(data.qr)
        setSecret(data.secret ?? '')
        setFactorId(data.id)
      }
      return
    }

    // webauthn
    setEnrolling('webauthn')
    setFactorId(data.id)
    if (!data.webauthn) return
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(data.webauthn.challenge), (c) =>
            c.charCodeAt(0),
          ),
          rp: data.webauthn.rp,
          user: {
            id: Uint8Array.from(atob(data.webauthn.user.id), (c) =>
              c.charCodeAt(0),
            ),
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

  async function completeTotpEnroll() {
    await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, code: verifyCode }),
    })
    setEnrolling(null)
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
                  {f.friendly_name ||
                    (f.type === 'webauthn' ? 'Passkey' : f.type.toUpperCase())}
                </Text>
                <Text element={{ size: 'xs' }} color="secondary">
                  Added {new Date(f.created_at).toLocaleDateString('en-US')}
                </Text>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => beginStepUp('remove', f.id)}
                disabled={pending !== null}
              >
                Remove
              </Button>
            </div>
          ))}
        </Stack>
      ) : (
        <Text element={{ size: 'sm' }} color="secondary">
          No 2FA methods configured.
        </Text>
      )}

      {pending ? (
        <Stack spacing="sm">
          <Text element={{ size: 'sm' }} weight="semibold">
            Confirm it&apos;s you
          </Text>
          {stepUpMode === 'password' ? (
            <>
              <Text element={{ size: 'xs' }} color="secondary">
                Re-enter your password to change your two-factor settings.
              </Text>
              <Input
                label={{ text: 'Password' }}
                type="password"
                value={{
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                }}
              />
            </>
          ) : (
            <>
              <Text element={{ size: 'xs' }} color="secondary">
                {codeSent
                  ? 'Enter the code we emailed you to change your two-factor settings.'
                  : 'Sending a verification code to your email...'}
              </Text>
              <Input
                label={{ text: 'Email code' }}
                value={{
                  value: emailToken,
                  onChange: (e) => setEmailToken(e.target.value),
                }}
                placeholder="Code from your email"
              />
            </>
          )}
          {stepUpError && (
            <Text element={{ size: 'sm' }} color="accent" role="alert">
              {stepUpError}
            </Text>
          )}
          <div style={{ display: 'flex', gap: 'var(--azimuth-space-sm)' }}>
            <Button
              variant="primary"
              onClick={confirmStepUp}
              disabled={stepUpBusy || (stepUpMode === 'email' && !codeSent)}
            >
              {stepUpBusy ? 'Verifying...' : 'Continue'}
            </Button>
            <Button variant="tertiary" onClick={cancelStepUp}>
              Cancel
            </Button>
          </div>
        </Stack>
      ) : enrolling === 'totp' ? (
        <Stack spacing="sm">
          <Text element={{ size: 'sm' }} weight="semibold">
            Option 1: Scan QR Code
          </Text>
          <Text element={{ size: 'xs' }}>
            Scan with your authenticator app (Google Authenticator, 1Password,
            etc.)
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
            Can&apos;t scan the QR? Enter this key manually in your
            authenticator app:
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
          <Text role="status" aria-live="polite">
            Setting up passkey...
          </Text>
        </Stack>
      ) : (
        <Stack spacing="sm">
          <Input
            label={{ text: 'Device name (optional)' }}
            name="friendlyName"
            value={{
              value: friendlyName,
              onChange: (e) => setFriendlyName(e.target.value),
            }}
            placeholder="e.g. My iPhone, Work Laptop"
          />
          <Button variant="primary" onClick={() => beginStepUp('totp')}>
            Set up Authenticator App
          </Button>
          <Button variant="tertiary" onClick={() => beginStepUp('webauthn')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PasskeyIcon /> Add Passkey
            </span>
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
