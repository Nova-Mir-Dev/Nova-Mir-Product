'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button, Input, Text, Stack } from 'azimuth-ui'

export function AdminLoginForm({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(redirect || '/admin')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        {error && <Text color="accent">{error}</Text>}
        <Input
          label={{ text: 'Email' }}
          type="email"
          value={{
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
          required
          placeholder="admin@novamir.dev"
        />
        <Input
          label={{ text: 'Password' }}
          type="password"
          value={{
            value: password,
            onChange: (e) => setPassword(e.target.value),
          }}
          required
          placeholder="Enter your password"
        />
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>
    </form>
  )
}
