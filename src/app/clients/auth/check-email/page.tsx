'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button, Card, Text, Stack } from 'azimuth-ui'
import styles from './check-email.module.css'

function CheckEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError('')

    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
      },
    })

    if (err) {
      setError(err.message)
      setResending(false)
      return
    }

    setResent(true)
    setResending(false)
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandName}>Nova Mir</div>
        </div>
        <Stack spacing="md">
          <Text element={{ as: 'h1', size: 'h3' }} weight="bold">
            Check your email
          </Text>

          <Text>
            We sent a magic link to <strong>{email || 'your email'}</strong>.
            Click the link to sign in.
          </Text>

          {error && <Text color="accent">{error}</Text>}

          {resent ? (
            <Text element={{ size: 'sm' }}>
              Magic link resent! Check your inbox.
            </Text>
          ) : (
            <Button variant="tertiary" onClick={handleResend}>
              {resending ? 'Sending...' : 'Resend magic link'}
            </Button>
          )}

          <Button
            variant="tertiary"
            onClick={() => router.push('/clients/auth/login')}
          >
            Back to login
          </Button>
        </Stack>
      </Card>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <Card className={styles.card}>
            <Text>Loading...</Text>
          </Card>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  )
}
