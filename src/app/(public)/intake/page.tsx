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

const BUSINESS_TYPE_OPTIONS = [
  { value: 'service', label: 'Service business' },
  { value: 'retail', label: 'Retail / E-commerce' },
  {
    value: 'professional',
    label: 'Professional services (law, accounting, consulting)',
  },
  { value: 'health', label: 'Health & wellness' },
  { value: 'hospitality', label: 'Food & hospitality' },
  { value: 'creative', label: 'Creative / Agency' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'other', label: 'Other' },
]

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' },
]

const YES_NO_SWITCH_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'coming-from', label: 'Coming from another provider' },
]

const YES_NO_NEEDS_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'needs-design', label: 'Needs design' },
]

const YES_NO_HELP_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'needs-help', label: 'Need copywriting help' },
]

const YES_NO_STOCK_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'needs-stock', label: 'Need stock photos' },
]

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP (within 2 weeks)' },
  { value: '1-month', label: '1 month' },
  { value: '2-3-months', label: '2-3 months' },
  { value: 'flexible', label: 'Flexible / No rush' },
  { value: 'not-sure', label: 'Not sure' },
]

const BUDGET_OPTIONS = [
  { value: 'under-1500', label: 'Under $1,500' },
  { value: '1500-3000', label: '$1,500 - $3,000' },
  { value: '3000-5000', label: '$3,000 - $5,000' },
  { value: '5000-plus', label: '$5,000+' },
  { value: 'not-sure', label: 'Not sure' },
]

function buildIntakeMessage(fields: Record<string, string>) {
  const sections = [
    '=== INTAKE FORM ===',
    '',
    '--- About Your Business ---',
    `Business Type: ${fields.businessType || 'Not specified'}`,
    `Target Audience: ${fields.targetAudience || 'Not specified'}`,
    `Current Website: ${fields.currentWebsite || 'Not specified'}`,
    `Primary Goals: ${fields.primaryGoals || 'Not specified'}`,
    '',
    '--- Project Scope ---',
    `Services Needed: ${fields.servicesNeeded || 'Not specified'}`,
    `Competitors: ${fields.competitors || 'Not specified'}`,
    `Existing Website: ${fields.existingWebsite || 'Not specified'}`,
    `Has Domain: ${fields.hasDomain || 'Not specified'}`,
    `Has Hosting: ${fields.hasHosting || 'Not specified'}`,
    '',
    '--- Creative & Content ---',
    `Has Logo: ${fields.hasLogo || 'Not specified'}`,
    `Has Brand Colors: ${fields.hasBrandColors || 'Not specified'}`,
    `Has Written Content: ${fields.hasWrittenContent || 'Not specified'}`,
    `Has Photos: ${fields.hasPhotos || 'Not specified'}`,
    `Style Preferences: ${fields.stylePreferences || 'Not specified'}`,
    '',
    '--- Technical Requirements ---',
    `Page Count: ${fields.pageCount || 'Not specified'}`,
    `Needs Forms: ${fields.needsForms || 'Not specified'}`,
    `Needs Booking: ${fields.needsBooking || 'Not specified'}`,
    `Needs Payments: ${fields.needsPayments || 'Not specified'}`,
    `Needs Dashboard: ${fields.needsDashboard || 'Not specified'}`,
    `Needs Email: ${fields.needsEmail || 'Not specified'}`,
    '',
    '--- Timeline & Budget ---',
    `Timeline: ${fields.timeline || 'Not specified'}`,
    `Budget Range: ${fields.budgetRange || 'Not specified'}`,
    `Additional Notes: ${fields.additionalNotes || 'Not specified'}`,
  ]

  return sections.join('\n')
}

export default function IntakePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')

  const [businessType, setBusinessType] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [currentWebsite, setCurrentWebsite] = useState('')
  const [primaryGoals, setPrimaryGoals] = useState('')

  const [servicesNeeded, setServicesNeeded] = useState('')
  const [competitors, setCompetitors] = useState('')
  const [existingWebsite, setExistingWebsite] = useState('')
  const [hasDomain, setHasDomain] = useState('')
  const [hasHosting, setHasHosting] = useState('')

  const [hasLogo, setHasLogo] = useState('')
  const [hasBrandColors, setHasBrandColors] = useState('')
  const [hasWrittenContent, setHasWrittenContent] = useState('')
  const [hasPhotos, setHasPhotos] = useState('')
  const [stylePreferences, setStylePreferences] = useState('')

  const [pageCount, setPageCount] = useState('')
  const [needsForms, setNeedsForms] = useState('')
  const [needsBooking, setNeedsBooking] = useState('')
  const [needsPayments, setNeedsPayments] = useState('')
  const [needsDashboard, setNeedsDashboard] = useState('')
  const [needsEmail, setNeedsEmail] = useState('')

  const [timeline, setTimeline] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const extraFields = {
    businessType,
    targetAudience,
    currentWebsite,
    primaryGoals,
    servicesNeeded,
    competitors,
    existingWebsite,
    hasDomain,
    hasHosting,
    hasLogo,
    hasBrandColors,
    hasWrittenContent,
    hasPhotos,
    stylePreferences,
    pageCount,
    needsForms,
    needsBooking,
    needsPayments,
    needsDashboard,
    needsEmail,
    timeline,
    additionalNotes,
  }

  const handleSubmit = useCallback(async () => {
    if (!consent) {
      setError('You must consent to data storage before submitting.')
      return
    }

    setError('')
    setLoading(true)

    const message = buildIntakeMessage(extraFields)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          businessName,
          phone: phone || undefined,
          serviceInterest: servicesNeeded || undefined,
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
    servicesNeeded,
    budgetRange,
    consent,
    extraFields,
  ])

  if (submitted) {
    return (
      <Container
        maxWidth={720}
        style={{ margin: '2rem auto', padding: '0 1rem' }}
      >
        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Thanks for sharing the details
            </Text>
            <Text element={{ size: 'base' }}>
              Your project intake has been received. I&rsquo;ll review it and
              follow up within 1-2 business days.
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
      maxWidth={720}
      style={{ margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Stack spacing="sm">
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            align="center"
          >
            Tell Me About Your Project
          </Text>
          <div style={{ textAlign: 'center' }}>
            <Text element={{ size: 'base' }} color="secondary" align="center">
              The more I know, the better I can help. I&rsquo;ll follow up within
              1-2 business days.
            </Text>
          </div>
        </Stack>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Contact Info
            </Text>
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
              label={{ text: 'Phone' }}
              value={{
                value: phone,
                onChange: (e) => setPhone(e.target.value),
              }}
            />
            <Input
              label={{ text: 'Business Name', required: true }}
              value={{
                value: businessName,
                onChange: (e) => setBusinessName(e.target.value),
              }}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              About Your Business
            </Text>
            <Select
              label={{ text: 'Business Type' }}
              options={BUSINESS_TYPE_OPTIONS}
              placeholder="Select your business type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
            <TextArea
              label={{ text: 'Target Audience' }}
              placeholder="Who are your ideal customers or clients?"
              value={{
                value: targetAudience,
                onChange: (e) => setTargetAudience(e.target.value),
              }}
            />
            <Input
              label={{ text: 'Current Website URL' }}
              placeholder="https://"
              value={{
                value: currentWebsite,
                onChange: (e) => setCurrentWebsite(e.target.value),
              }}
            />
            <TextArea
              label={{ text: 'Primary Goals', required: true }}
              placeholder="What do you want your website to accomplish?"
              value={{
                value: primaryGoals,
                onChange: (e) => setPrimaryGoals(e.target.value),
              }}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Project Scope
            </Text>
            <TextArea
              label={{
                text: 'What services are you looking for?',
                required: true,
              }}
              placeholder="Website, lead system, booking, payments, etc."
              value={{
                value: servicesNeeded,
                onChange: (e) => setServicesNeeded(e.target.value),
              }}
            />
            <TextArea
              label={{ text: 'Competitors' }}
              placeholder="Who are your competitors? Share URLs if you have them."
              value={{
                value: competitors,
                onChange: (e) => setCompetitors(e.target.value),
              }}
            />
            <Select
              label={{ text: 'Do you have an existing website?' }}
              options={YES_NO_SWITCH_OPTIONS}
              placeholder="Select an option"
              value={existingWebsite}
              onChange={(e) => setExistingWebsite(e.target.value)}
            />
            <Select
              label={{ text: 'Do you have a domain?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={hasDomain}
              onChange={(e) => setHasDomain(e.target.value)}
            />
            <Select
              label={{ text: 'Do you have hosting?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={hasHosting}
              onChange={(e) => setHasHosting(e.target.value)}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Creative &amp; Content
            </Text>
            <Select
              label={{ text: 'Do you have a logo?' }}
              options={YES_NO_NEEDS_OPTIONS}
              placeholder="Select an option"
              value={hasLogo}
              onChange={(e) => setHasLogo(e.target.value)}
            />
            <Select
              label={{ text: 'Do you have brand colors/styles?' }}
              options={YES_NO_NEEDS_OPTIONS}
              placeholder="Select an option"
              value={hasBrandColors}
              onChange={(e) => setHasBrandColors(e.target.value)}
            />
            <Select
              label={{ text: 'Do you have written content?' }}
              options={YES_NO_HELP_OPTIONS}
              placeholder="Select an option"
              value={hasWrittenContent}
              onChange={(e) => setHasWrittenContent(e.target.value)}
            />
            <Select
              label={{ text: 'Do you have photos/images?' }}
              options={YES_NO_STOCK_OPTIONS}
              placeholder="Select an option"
              value={hasPhotos}
              onChange={(e) => setHasPhotos(e.target.value)}
            />
            <TextArea
              label={{ text: 'Style Preferences' }}
              placeholder="Describe the look and feel you want (modern, classic, minimalist, bold, etc.)"
              value={{
                value: stylePreferences,
                onChange: (e) => setStylePreferences(e.target.value),
              }}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Technical Requirements
            </Text>
            <Input
              label={{ text: 'How many pages do you need?' }}
              placeholder="Approximate number"
              value={{
                value: pageCount,
                onChange: (e) => setPageCount(e.target.value),
              }}
            />
            <Select
              label={{ text: 'Do you need forms?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={needsForms}
              onChange={(e) => setNeedsForms(e.target.value)}
            />
            <Select
              label={{ text: 'Do you need booking/scheduling?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={needsBooking}
              onChange={(e) => setNeedsBooking(e.target.value)}
            />
            <Select
              label={{ text: 'Do you need payments?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={needsPayments}
              onChange={(e) => setNeedsPayments(e.target.value)}
            />
            <Select
              label={{ text: 'Do you need a dashboard/admin area?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={needsDashboard}
              onChange={(e) => setNeedsDashboard(e.target.value)}
            />
            <Select
              label={{ text: 'Do you need email setup?' }}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              value={needsEmail}
              onChange={(e) => setNeedsEmail(e.target.value)}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Timeline &amp; Budget
            </Text>
            <Select
              label={{ text: 'When do you need this by?' }}
              options={TIMELINE_OPTIONS}
              placeholder="Select a timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
            <Select
              label={{ text: 'Budget Range' }}
              options={BUDGET_OPTIONS}
              placeholder="Select a budget range"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
            />
            <TextArea
              label={{ text: 'Additional Notes' }}
              placeholder="Anything else you'd like me to know?"
              value={{
                value: additionalNotes,
                onChange: (e) => setAdditionalNotes(e.target.value),
              }}
            />
          </Stack>
        </Card>

        <Card>
          <Stack spacing="md">
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
              {loading ? 'Submitting...' : 'Submit Intake Form'}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
