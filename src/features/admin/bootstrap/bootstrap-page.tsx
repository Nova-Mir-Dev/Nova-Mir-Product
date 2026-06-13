'use client'

import { useCallback, useState } from 'react'
import { Button, Stack, Text } from 'azimuth-ui'
import type { Preset, ConfigValues } from './types'
import PresetGrid from './components/preset-grid'
import ConfigForm from './components/config-form'
import ValidationResult from './components/validation-result'
import styles from './bootstrap-page.module.css'

const PRESETS: Preset[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Minimal Next.js scaffold with your chosen stack.',
    icon: '◇',
    popular: false,
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description:
      'Auth, payments, multi-tenant, realtime, AI SDK, background jobs.',
    icon: '◎',
    popular: true,
  },
  {
    id: 'portfolio-clients',
    name: 'Client Portal',
    description: 'Project tracking, invoicing, file sharing, appointments.',
    icon: '◈',
    popular: false,
  },
  {
    id: 'marketing-site',
    name: 'Marketing Site',
    description: 'Public site with SEO, CMS, WAF, CDN — no auth.',
    icon: '◉',
    popular: true,
  },
  {
    id: 'lead-gen-site',
    name: 'Lead Gen Site',
    description: 'Lead capture with CRM, forms, analytics, email.',
    icon: '◍',
    popular: false,
  },
  {
    id: 'booking-site',
    name: 'Booking Site',
    description: 'Appointments with calendar sync, payments, SMS.',
    icon: '▣',
    popular: false,
  },
  {
    id: 'storefront',
    name: 'Storefront',
    description: 'E-commerce with catalog, cart, checkout.',
    icon: '▤',
    popular: false,
  },
  {
    id: 'internal-tool',
    name: 'Internal Tool',
    description: 'Admin dashboard with data tables, file mgmt.',
    icon: '▥',
    popular: false,
  },
  {
    id: 'membership-site',
    name: 'Membership Site',
    description: 'Subscriptions with tiered access, payments.',
    icon: '▦',
    popular: false,
  },
]

export default function BootstrapPage() {
  const [preset, setPreset] = useState('saas-starter')
  const [config, setConfig] = useState<ConfigValues>({
    projectName: '',
    framework: 'nextjs',
    hosting: 'vercel',
    database: 'postgresql',
    auth: 'supabase-auth',
    payments: 'stripe',
  })
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = useCallback((key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError('')
      setResult(null)

      try {
        const res = await fetch('/api/admin/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preset,
            projectName: config.projectName || `${preset}-app`,
            framework: config.framework,
            hosting: config.hosting,
            database: config.database,
            auth: config.auth,
            payments: config.payments,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to validate config')
        }

        const data = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [preset, config],
  )

  return (
    <Stack spacing="lg">
      <div>
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Project Bootstrapper
        </Text>
        <Text>
          Generate a new project from a preset. The server validates your config
          and prepares the scaffold.
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <PresetGrid
            presets={PRESETS}
            selected={preset}
            onSelect={setPreset}
          />

          <ConfigForm config={config} preset={preset} onChange={handleChange} />

          <div className={styles.actions}>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Validating...' : 'Validate Config'}
            </Button>
          </div>
        </Stack>
      </form>

      <ValidationResult result={result} loading={loading} error={error} />
    </Stack>
  )
}
