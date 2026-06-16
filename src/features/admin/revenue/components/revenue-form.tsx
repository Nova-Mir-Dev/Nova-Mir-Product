'use client'

import { useRouter } from 'next/navigation'
import { Button, Card, Input, Stack, Text } from 'azimuth-ui'
import { createRevenueEntry } from '../actions'
import styles from '../revenue-page.module.css'

interface RevenueFormProps {
  categoryLabels: Record<string, string>
}

export function RevenueForm({ categoryLabels }: RevenueFormProps) {
  const router = useRouter()

  return (
    <Card>
      <form
        action={async (formData) => {
          const result = await createRevenueEntry(null, formData)
          if (result?.error) {
            alert(result.error)
          } else {
            router.push('/admin/revenue')
          }
        }}
      >
        <Stack spacing="sm">
          <Input label={{ text: 'Client Name' }} name="clientName" required />
          <Input label={{ text: 'Description' }} name="description" required />
          <Input
            label={{ text: 'Amount ($)' }}
            name="amount"
            type="number"
            stepper={{ enabled: true, step: 0.01 }}
            required
          />
          <label>
            <Text element={{ size: 'sm' }}>Category</Text>
            <select
              name="category"
              required
              style={{
                width: '100%',
                padding: 'var(--azimuth-spacing-xs)',
                borderRadius: 'var(--azimuth-radius-sm)',
                border: '1px solid var(--azimuth-color-border)',
              }}
            >
              <option value="">Select category...</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label={{ text: 'Date' }}
            name="recordedAt"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
          <div className={styles.formActions}>
            <Button variant="primary" type="submit">
              Create
            </Button>
            <a href="/admin/revenue">
              <Button variant="tertiary" type="button">
                Cancel
              </Button>
            </a>
          </div>
        </Stack>
      </form>
    </Card>
  )
}
