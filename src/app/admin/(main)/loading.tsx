import { Card, Grid, Skeleton, Stack } from 'azimuth-ui'

export default function AdminDashboardLoading() {
  return (
    <Stack spacing="md">
      <Skeleton width="200px" height="32px" />

      <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="var(--azimuth-spacing-md)">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Stack spacing="sm">
              <Skeleton width="80px" height="36px" variant="rect" />
              <Skeleton width="120px" height="16px" />
              <Skeleton width="160px" height="12px" />
            </Stack>
          </Card>
        ))}
      </Grid>

      <Grid cols={{ base: 1, lg: 2 }} gap="var(--azimuth-spacing-md)">
        <Stack spacing="sm">
          <Skeleton width="160px" height="24px" />
          <Stack spacing="xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Stack spacing="xs">
                  <Skeleton width="140px" height="16px" />
                  <Skeleton width="200px" height="14px" />
                  <Skeleton width="100px" height="12px" />
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>

        <Stack spacing="sm">
          <Skeleton width="120px" height="24px" />
          <Grid cols={{ base: 1, sm: 2 }} gap="var(--azimuth-spacing-sm)">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton width="100px" height="16px" />
                <Skeleton width="140px" height="14px" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Stack>
  )
}
