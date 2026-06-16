'use client'

import { Card } from 'azimuth-ui'
import { ClientLoginForm } from '@/features/auth/components/client-login-form'
import styles from './client-login.module.css'

export default function ClientLoginPage() {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.brandName}>Nova Mir</h1>
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
