'use client'

import { useState } from 'react'
import { loginAction } from '../actions'
import { Button, Input, Text, Stack } from 'azimuth-ui'

export function AdminLoginForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = redirectTo
      ? await loginAction(email, password, redirectTo)
      : await loginAction(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
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
