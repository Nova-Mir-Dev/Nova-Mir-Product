'use client'

import { useState } from 'react'
import { Card, Stack, Text, Button, Input, Alert } from 'azimuth-ui'
import { createAdminUser } from './actions'

export function InviteForm() {
  const [email, setEmail] = useState('')
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
    form.set('name', name)
    form.set('role', 'admin')

    try {
      await createAdminUser(form)
      setResult({ type: 'success', message: `Invitation sent to ${email}` })
      setEmail('')
      setName('')
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed',
      })
    }
    setLoading(false)
  }

  return (
    <Card style={{ marginTop: '1rem' }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <Text element={{ as: 'h2', size: 'h4' }} weight="semibold">
            Invite Admin User
          </Text>

          {result && (
            <Alert variant={result.type === 'error' ? 'alert' : 'info'}>
              {result.message}
            </Alert>
          )}

          <Input
            label={{ text: 'Name' }}
            value={{ value: name, onChange: (e) => setName(e.target.value) }}
            placeholder="Liz"
          />
          <Input
            label={{ text: 'Email' }}
            type="email"
            value={{ value: email, onChange: (e) => setEmail(e.target.value) }}
            placeholder="liz@novamir.dev"
          />
          <Text element={{ size: 'xs' }} color="secondary">
            Invited users get full admin access.
          </Text>

          <Button
            variant="primary"
            type="submit"
            disabled={loading || !email || !name}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
