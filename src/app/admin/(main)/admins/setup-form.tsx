'use client'

import { useState } from 'react'
import { Container, Text, Button, Card, Stack, Input, Alert } from 'azimuth-ui'
import { createFirstAdmin } from './actions'

export function AdminSetupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const form = new FormData()
    form.set('email', email)
    form.set('password', password)
    form.set('name', name)

    try {
      await createFirstAdmin(form)
      setResult({
        type: 'success',
        message: 'Admin user created! Redirecting to login...',
      })
      setTimeout(() => window.location.assign('/admin/auth/login'), 1500)
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed',
      })
    }
    setLoading(false)
  }

  return (
    <Container
      style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}
    >
      <Card>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Text element={{ as: 'h1', size: 'h3' }} weight="bold">
              Create Admin Account
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              No admin users exist yet. Create the first account to get started.
            </Text>

            {result && (
              <Alert variant={result.type === 'error' ? 'alert' : 'info'}>
                {result.message}
              </Alert>
            )}

            <Input
              label={{ text: 'Name' }}
              value={{ value: name, onChange: (e) => setName(e.target.value) }}
              placeholder="Jasper"
            />
            <Input
              label={{ text: 'Email' }}
              type="email"
              value={{
                value: email,
                onChange: (e) => setEmail(e.target.value),
              }}
              placeholder="jasper@novamir.dev"
            />
            <Input
              label={{ text: 'Password' }}
              type="password"
              value={{
                value: password,
                onChange: (e) => setPassword(e.target.value),
              }}
              placeholder="At least 8 characters"
            />

            <Button
              variant="primary"
              type="submit"
              disabled={loading || !email || !password || !name}
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  )
}
