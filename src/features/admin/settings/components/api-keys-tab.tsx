'use client'

import { useActionState } from 'react'
import { Stack, Text, Card, Button, Divider, EmptyState } from 'azimuth-ui'
import { createApiKey, revokeApiKey } from '../actions'
import type { CreateApiKeyResult } from '../actions'
import styles from '../settings-page.module.css'

export interface ApiKeyItem {
  id: string
  prefix: string
  created_at: string
}

export const ApiKeysTab = ({ apiKeys }: { apiKeys: ApiKeyItem[] }) => {
  const [createResult, createAction, isCreating] = useActionState<
    CreateApiKeyResult | null,
    FormData
  >(createApiKey, null)

  return (
    <Card>
      <Stack spacing="md">
        <Stack spacing="xs">
          <Text element={{ as: 'h2', size: 'lg' }} weight="semibold">
            API Keys
          </Text>
          <Text element={{ size: 'sm' }}>
            API keys let external services authenticate against Nova Mir APIs.
          </Text>
        </Stack>
        <Divider />
        {createResult?.success && createResult.key && (
          <Card>
            <Stack spacing="xs">
              <Text weight="semibold">API Key Created</Text>
              <Text element={{ size: 'sm' }}>
                Copy this key now. You won&apos;t be able to see it again.
              </Text>
              <Text className={styles.apiKeyPrefix}>{createResult.key}</Text>
            </Stack>
          </Card>
        )}
        <div role="status" aria-live="polite">
          {createResult?.error && (
            <Text element={{ size: 'sm' }}>{createResult.error}</Text>
          )}
        </div>
        {apiKeys.length === 0 ? (
          <EmptyState
            title="No API keys"
            description="You haven't created any API keys yet."
          />
        ) : (
          <Stack spacing="xs">
            {apiKeys.map((key) => (
              <div key={key.id} className={styles.apiKeyRow}>
                <Stack spacing="xs">
                  <span className={styles.apiKeyPrefix}>{key.prefix}...</span>
                  <Text element={{ size: 'xs' }}>
                    Created{' '}
                    {new Date(key.created_at).toLocaleDateString('en-US')}
                  </Text>
                </Stack>
                <form action={revokeApiKey}>
                  <input type="hidden" name="id" value={key.id} />
                  <Button variant="danger" size="sm" type="submit">
                    Revoke
                  </Button>
                </form>
              </div>
            ))}
          </Stack>
        )}
        <Divider />
        <form action={createAction}>
          <Button variant="primary" type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create API Key'}
          </Button>
        </form>
      </Stack>
    </Card>
  )
}
