'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Text, Card, Stack, Button } from 'azimuth-ui'
import styles from './dashboard.module.css'

interface ClientProfile {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
}

interface UserProfile {
  id: string
  name: string
  email: string
}

const STAGES = [
  { key: 'planning', label: 'Planning' },
  { key: 'design', label: 'Design' },
  { key: 'build', label: 'Build' },
  { key: 'launch', label: 'Launch' },
] as const

export default function DashboardPage() {
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/clients/me').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([userData, clientData]) => {
        setProfile(userData as UserProfile | null)
        if (clientData) {
          setClient(clientData as ClientProfile)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Text>Loading dashboard...</Text>
  }

  if (notFound || !client) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.emptyStateHeading}>Welcome to Nova Mir</h1>
          <p className={styles.emptyStateText}>
            Your project dashboard will appear here once your account is set up.
          </p>
          <p className={styles.emptyStateText}>
            If you believe this is an error, please contact support.
          </p>
          <a href="mailto:support@novamir.dev">
            <Button variant="primary" type="button">
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    )
  }

  const displayName = profile?.name ?? client.name

  return (
    <div className={styles.container}>
      <div className={styles.welcomeBanner}>
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Welcome, {displayName}!
        </Text>
      </div>

      <div className={styles.projectStatusBar}>
        {STAGES.map((stage, index) => {
          const isPlanning = stage.key === 'planning'
          return (
            <>
              {index > 0 && (
                <div
                  className={`${styles.stageConnector} ${isPlanning ? styles.stageConnectorActive : ''}`}
                />
              )}
              <div className={styles.stageItem} key={stage.key}>
                <div
                  className={`${styles.stageCircle} ${isPlanning ? styles.stageCircleActive : styles.stageCircleFuture}`}
                >
                  {index + 1}
                </div>
                <span
                  className={`${styles.stageLabel} ${isPlanning ? styles.stageLabelActive : ''}`}
                >
                  {stage.label}
                </span>
              </div>
            </>
          )
        })}
      </div>

      <div className={styles.quickActions}>
        <Link href="/clients/billing" className={styles.actionCard}>
          <Card>
            <Stack spacing="sm" style={{ textAlign: 'center', padding: '16px' }}>
              <Text element={{ size: 'h4' }} weight="semibold">
                View Invoice
              </Text>
              <Text element={{ size: 'sm' }} color="secondary">
                See your current billing details
              </Text>
            </Stack>
          </Card>
        </Link>

        <a href="mailto:support@novamir.dev" className={styles.actionCard}>
          <Card>
            <Stack spacing="sm" style={{ textAlign: 'center', padding: '16px' }}>
              <Text element={{ size: 'h4' }} weight="semibold">
                Contact Support
              </Text>
              <Text element={{ size: 'sm' }} color="secondary">
                Reach out to our team
              </Text>
            </Stack>
          </Card>
        </a>

        <Card>
          <Stack spacing="sm" style={{ textAlign: 'center', padding: '16px' }}>
            <Text element={{ size: 'h4' }} weight="semibold">
              Upload Document
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              Coming soon
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  )
}
