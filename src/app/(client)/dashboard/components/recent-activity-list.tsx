import { Card, Stack, Text } from 'azimuth-ui'

export interface DashboardActivity {
  id: string
  action: string
  project_name: string | null
  created_at: string
}

export function RecentActivityList({
  activity,
}: {
  activity: DashboardActivity[]
}) {
  return (
    <Stack spacing="sm">
      <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
        Recent Activity
      </Text>
      {activity.length > 0 ? (
        <Stack spacing="xs">
          {activity.map((a) => (
            <Card key={a.id}>
              <Stack spacing="xs">
                <Text element={{ size: 'sm' }} weight="semibold">
                  {a.action}
                </Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  {a.project_name} —{' '}
                  {new Date(a.created_at).toLocaleString('en-US')}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <Text color="secondary" element={{ size: 'sm' }}>
          No recent activity.
        </Text>
      )}
    </Stack>
  )
}
