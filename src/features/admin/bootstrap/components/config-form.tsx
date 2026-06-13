'use client'

import { Input, Select, Text } from 'azimuth-ui'
import type { ConfigValues } from '../types'
import styles from './config-form.module.css'

const frameworkOptions = [
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Vite + React', value: 'vite-react' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
]

const hostingOptions = [
  { label: 'Vercel', value: 'vercel' },
  { label: 'AWS', value: 'aws' },
  { label: 'GCP', value: 'gcp' },
  { label: 'Azure', value: 'azure' },
  { label: 'Custom', value: 'custom' },
]

const databaseOptions = [
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'DynamoDB', value: 'dynamodb' },
]

const authOptions = [
  { label: 'None', value: 'none' },
  { label: 'Supabase Auth', value: 'supabase-auth' },
  { label: 'Next-Auth', value: 'next-auth' },
  { label: 'JWT', value: 'jwt' },
  { label: 'Clerk', value: 'clerk' },
  { label: 'Auth0', value: 'auth0' },
]

const paymentOptions = [
  { label: 'None', value: 'none' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Lemon Squeezy', value: 'lemonsqueezy' },
  { label: 'Paddle', value: 'paddle' },
]

interface ConfigFormProps {
  config: ConfigValues
  preset: string
  onChange: (key: string, value: string) => void
}

export default function ConfigForm({
  config,
  preset,
  onChange,
}: ConfigFormProps) {
  return (
    <fieldset className={styles.fieldset}>
      <Text
        element={{ as: 'h2', size: 'h5' }}
        weight="semibold"
        className={styles.title}
      >
        2. Configure
      </Text>

      <Input
        label={{ text: 'Project Name' }}
        value={{
          value: config.projectName,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange('projectName', e.target.value),
        }}
        placeholder={`${preset}-app`}
        style={{ marginBottom: 'var(--azimuth-spacing-sm)' }}
      />

      <div className={styles.grid}>
        <Select
          label={{ text: 'Framework' }}
          options={frameworkOptions}
          value={config.framework}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('framework', e.target.value)
          }
        />

        <Select
          label={{ text: 'Hosting' }}
          options={hostingOptions}
          value={config.hosting}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('hosting', e.target.value)
          }
        />

        <Select
          label={{ text: 'Database' }}
          options={databaseOptions}
          value={config.database}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('database', e.target.value)
          }
        />

        <Select
          label={{ text: 'Auth' }}
          options={authOptions}
          value={config.auth}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('auth', e.target.value)
          }
        />

        <Select
          label={{ text: 'Payments' }}
          options={paymentOptions}
          value={config.payments}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('payments', e.target.value)
          }
        />
      </div>
    </fieldset>
  )
}
