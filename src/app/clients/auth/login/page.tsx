'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Text } from 'azimuth-ui'
import { ClientLoginForm } from '@/features/auth/components/client-login-form'
import styles from './client-login.module.css'

function ClientLoginContent() {
  useSearchParams()

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandName}>Nova Mir</div>
          <div className={styles.brandSubtitle}>Client Portal</div>
        </div>
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
