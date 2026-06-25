'use client'

import { useCallback, useState } from 'react'
import { Button, Container, Input, Stack, Text } from 'azimuth-ui'

export default function DoNotSellPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/compliance/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email])

  if (submitted) {
    return (
      <Container maxWidth={480} style={{ padding: '3rem 1rem' }}>
        <Stack spacing="md">
          <Text element={{ as: 'h1', size: 'h3' }} weight="bold">
            Your request has been submitted
          </Text>
          <Text>We have recorded your opt-out preference.</Text>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth={480} style={{ padding: '3rem 1rem' }}>
      <Stack spacing="lg">
        <Text element={{ as: 'h1', size: 'h3' }} weight="bold">
          Do Not Sell My Personal Information
        </Text>
        <Text element={{ size: 'sm' }} color="secondary">
          Under the California Consumer Privacy Act (CCPA), you have the right
          to opt out of the sale of your personal information. Nova Mir does not
          sell personal information, but we respect your preference.
        </Text>
        <Input
          label={{ text: 'Email address', required: true }}
          value={{ value: email, onChange: (e) => setEmail(e.target.value) }}
        />
        {error && (
          <Text style={{ color: 'var(--azimuth-color-danger)' }}>{error}</Text>
        )}
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Opt Out'}
        </Button>
      </Stack>
    </Container>
  )
}
