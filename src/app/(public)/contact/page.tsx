'use client'

import { useCallback, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Container,
  Input,
  Select,
  Stack,
  Text,
  TextArea,
} from 'azimuth-ui'

const SERVICE_OPTIONS = [
  { value: 'managed-website', label: 'Managed Website' },
  { value: 'website-lead', label: 'Website + Lead System' },
  { value: 'website-ops', label: 'Website + Operations System' },
  { value: 'not-sure', label: 'Not sure yet' },
]

const BUDGET_OPTIONS = [
  { value: 'under-1500', label: 'Under $1,500' },
  { value: '1500-3000', label: '$1,500 - $3,000' },
  { value: '3000-5000', label: '$3,000 - $5,000' },
  { value: '5000-plus', label: '$5,000+' },
  { value: 'not-sure', label: 'Not sure' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceInterest, setServiceInterest] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!consent) {
      setError('You must consent to data storage before submitting.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          businessName,
          phone: phone || undefined,
          serviceInterest: serviceInterest || undefined,
          budgetRange: budgetRange || undefined,
          message,
          consent,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.error ?? 'Something went wrong. Please try again.',
        )
      }
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [
    name,
    email,
    businessName,
    phone,
    serviceInterest,
    budgetRange,
    message,
    consent,
  ])

  if (submitted) {
    return (
      <Container
        style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}
      >
        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Thanks for reaching out
            </Text>
            <Text element={{ size: 'base' }}>
              Your message has been received. I typically follow up within 1-2
              business days.
            </Text>
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/')}
            >
              Back to Home
            </Button>
          </Stack>
        </Card>
      </Container>
    )
  }

  return (
    <Container
      style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Stack spacing="sm">
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            style={{ textAlign: 'center' }}
          >
            Let&rsquo;s Build Something
          </Text>
          <Text
            element={{ size: 'base' }}
            color="secondary"
            style={{ textAlign: 'center' }}
          >
            Tell me about your project and I&rsquo;ll follow up within 1-2
            business days.
          </Text>
        </Stack>

        <Card>
          <Stack spacing="md">
            <Input
              label={{ text: 'Full Name', required: true }}
              value={{ value: name, onChange: (e) => setName(e.target.value) }}
            />
            <Input
              label={{ text: 'Email', required: true }}
              value={{
                value: email,
                onChange: (e) => setEmail(e.target.value),
              }}
            />
            <Input
              label={{ text: 'Business Name', required: true }}
              value={{
                value: businessName,
                onChange: (e) => setBusinessName(e.target.value),
              }}
            />
            <Input
              label={{ text: 'Phone' }}
              value={{
                value: phone,
                onChange: (e) => setPhone(e.target.value),
              }}
            />
            <Select
              label={{ text: 'Service Interest' }}
              options={SERVICE_OPTIONS}
              placeholder="Select a service"
              value={serviceInterest}
              onChange={(e) => setServiceInterest(e.target.value)}
            />
            <Select
              label={{ text: 'Budget Range' }}
              options={BUDGET_OPTIONS}
              placeholder="Select a budget range"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
            />
            <TextArea
              label={{ text: 'Message / Project Description', required: true }}
              value={{
                value: message,
                onChange: (e) => setMessage(e.target.value),
              }}
            />

            <Checkbox
              label="I consent to Nova Mir storing my submitted information so they can respond to my inquiry."
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />

            {error && (
              <Text
                element={{ size: 'sm' }}
                style={{ color: 'var(--azimuth-color-danger)' }}
              >
                {error}
              </Text>
            )}

            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
