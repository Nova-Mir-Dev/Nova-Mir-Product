'use client'

import { Alert, Badge, Card, Loader, Stack, Text } from 'azimuth-ui'
import styles from './validation-result.module.css'

interface ValidationResultProps {
  result: Record<string, unknown> | null
  loading: boolean
  error: string
}

export default function ValidationResult({
  result,
  loading,
  error,
}: ValidationResultProps) {
  if (loading) {
    return <Loader variant="circle" label="Validating config..." />
  }

  return (
    <>
      {error && <Alert variant="alert">{error}</Alert>}

      {result && (
        <Card>
          <Stack spacing="sm">
            <Text weight="semibold">Configuration Result</Text>

            {((result.warnings ?? []) as string[]).length > 0 && (
              <Alert variant="alert">
                <Text weight="semibold">Warnings:</Text>
                <ul className={styles.list}>
                  {(result.warnings as string[]).map((w: string, i: number) => (
                    <li key={i}>
                      <Text element={{ size: 'sm' }}>{w}</Text>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <div className={styles.configGrid}>
              {Object.entries(result.config as Record<string, string>).map(
                ([key, value]) => (
                  <div key={key} className={styles.configRow}>
                    <Text weight="semibold" className={styles.configLabel}>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (s) => s.toUpperCase())}
                    </Text>
                    <Text className={styles.configValue}>{value}</Text>
                  </div>
                ),
              )}
            </div>

            <Badge variant={result.valid ? 'success' : 'warning'}>
              {result.valid ? 'Valid' : 'Issues Found'}
            </Badge>

            <Text element={{ size: 'sm' }} className={styles.footnote}>
              Full generation and deploy coming soon — this validates your
              config against the bootstrapper engine.
            </Text>
          </Stack>
        </Card>
      )}
    </>
  )
}
