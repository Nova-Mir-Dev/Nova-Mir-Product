'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button, Input, Text, Stack } from 'azimuth-ui'

export function ClientLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

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
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/clients/auth/check-email?email=' + encodeURIComponent(email))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        {error && (
          <Text color="accent" role="alert">
            {error}
          </Text>
        )}
        <Input
          label={{ text: 'Email' }}
          type="email"
          value={{
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
          required
          placeholder="you@example.com"
        />
        <Text element={{ size: 'sm' }} color="secondary">
          We&apos;ll send a magic link to your email. No password needed.
        </Text>
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </Stack>
    </form>
  )
}
