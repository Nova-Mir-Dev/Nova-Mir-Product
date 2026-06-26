'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Text } from 'azimuth-ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminLoginForm } from '@/features/auth/components/admin-login-form'
import styles from './admin-login.module.css'

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || ''

  return (
    <div className={styles.container}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.brandName}>Nova Mir</h1>
          <div className={styles.brandSubtitle}>Admin Portal</div>
        </div>
        <AdminLoginForm redirectTo={redirect || undefined} />
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
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
      <AdminLoginContent />
    </Suspense>
  )
}
