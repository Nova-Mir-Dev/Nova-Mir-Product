'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button, Card, Input, Text, Stack } from 'azimuth-ui'
import { useRouter } from 'next/navigation'
import styles from './login-form.module.css'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (err) {
      setError(err.message)
      return
    }
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <Card>
        <Stack spacing="md">
          <Text element={{ as: 'h1', size: 'h2' }} weight="bold">
            Sign In
          </Text>
          {error && <Text color="accent">{error}</Text>}
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <Input
                label={{ text: 'Email' }}
                value={{
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                }}
                required
              />
              <Input
                label={{ text: 'Password' }}
                value={{
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                }}
                required
              />
              <Button type="submit" variant="primary" fullWidth>
                Sign In
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </div>
  )
}
