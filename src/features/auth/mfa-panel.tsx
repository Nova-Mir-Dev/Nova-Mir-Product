'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Card, Input, Text, Stack } from 'azimuth-ui'
import styles from './mfa-panel.module.css'

export function MfaPanel({
  factors,
}: {
  factors: { id: string; type: string; created_at: string }[]
}) {
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')

  async function startEnroll() {
    const res = await fetch('/api/auth/mfa/enroll', { method: 'POST' })
    const data = await res.json()
    if (data.qr) {
      setQrCode(data.qr)
      setFactorId(data.id)
      setEnrolling(true)
    }
  }

  async function completeEnroll() {
    await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, code: verifyCode }),
    })
    setEnrolling(false)
    window.location.reload()
  }

  return (
    <Card>
      <Stack spacing="md">
        <Text element={{ as: 'h2', size: 'h4' }} weight="semibold">
          Two-Factor Authentication
        </Text>
        {factors.length > 0 ? (
          factors.map((f) => (
            <div key={f.id}>
              <Text element={{ size: 'sm' }}>
                {String(f.type).toUpperCase()} — enabled{' '}
                {new Date(f.created_at).toLocaleDateString()}
              </Text>
            </div>
          ))
        ) : (
          <Text element={{ size: 'sm' }} color="secondary">
            No 2FA methods configured.
          </Text>
        )}
        {enrolling ? (
          <Stack spacing="sm">
            <Text element={{ size: 'xs' }}>
              Scan this QR code with your authenticator app, then enter the
              code:
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
            <Input
              label={{ text: 'Verification Code' }}
              value={{
                value: verifyCode,
                onChange: (e) => setVerifyCode(e.target.value),
              }}
            />
            <Button variant="primary" onClick={completeEnroll}>
              Verify & Enable
            </Button>
          </Stack>
        ) : (
          <Button variant="primary" onClick={startEnroll}>
            Enable 2FA
          </Button>
        )}
      </Stack>
    </Card>
  )
}
