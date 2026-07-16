import { Stack } from 'azimuth-ui'
import { MfaPanel } from '@/features/auth/mfa-panel'

export const SecurityTab = ({
  factors,
}: {
  factors: {
    id: string
    type: string
    created_at: string
    friendly_name?: string | null
  }[]
}) => (
  <Stack spacing="md">
    <MfaPanel factors={factors} stepUpMode="password" />
  </Stack>
)
