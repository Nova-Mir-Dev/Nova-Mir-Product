'use client'

import { Card, Stack, Text } from 'azimuth-ui'
import styles from '../revenue-page.module.css'

interface CategoryBreakdownProps {
  title: string
  categories: Record<string, number>
  categoryLabels: Record<string, string>
  formatAmount: (cents: number) => string
  emptyMessage: string
}

export function CategoryBreakdown({
  title,
  categories,
  categoryLabels,
  formatAmount,
  emptyMessage,
}: CategoryBreakdownProps) {
  return (
    <Card>
      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          {title}
        </Text>
        {Object.keys(categories).length === 0 ? (
          <Text color="muted">{emptyMessage}</Text>
        ) : (
          <div className={styles.categoryGrid}>
            {Object.entries(categories).map(([cat, amount]) => (
              <Card key={cat} className={styles.statCard}>
                <Stack spacing="xs">
                  <Text element={{ size: 'sm' }} color="secondary">
                    {categoryLabels[cat] ?? cat}
                  </Text>
                  <Text weight="semibold">{formatAmount(amount)}</Text>
                </Stack>
              </Card>
            ))}
          </div>
        )}
      </Stack>
    </Card>
  )
}
