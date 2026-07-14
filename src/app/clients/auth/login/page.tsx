'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, Card, Text } from 'azimuth-ui'
import { ClientLoginForm } from '@/features/auth/components/client-login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import styles from './client-login.module.css'

function ClientLoginContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  return (
    <div className={styles.container}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.brandName}>Nova Mir</h1>
          <div className={styles.brandSubtitle}>Client Portal</div>
        </div>
        {reason === 'service_unavailable' && (
          <Alert variant="info">
            We&apos;re having trouble connecting right now. Sign-in is
            temporarily unavailable — please try again in a few minutes.
          </Alert>
        )}
        <ClientLoginForm />
        <p className={styles.helpText} style={{ marginTop: '1rem' }}>
          New client? Contact your project manager to get started.
        </p>
      </Card>
    </div>
  )
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <Card className={styles.card}>
            <Text>Loading...</Text>
          </Card>
        </div>
      }
    >
      <ClientLoginContent />
    </Suspense>
  )
}
