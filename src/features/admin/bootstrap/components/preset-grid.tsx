'use client'

import { Badge, Card, Grid, Text } from 'azimuth-ui'
import type { Preset } from '../types'
import styles from './preset-grid.module.css'

interface PresetGridProps {
  presets: Preset[]
  selected: string
  onSelect: (id: string) => void
}

export default function PresetGrid({
  presets,
  selected,
  onSelect,
}: PresetGridProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <Text
        element={{ as: 'h2', size: 'h5' }}
        weight="semibold"
        style={{ marginBottom: 'var(--azimuth-space-sm)' }}
      >
        1. Choose a Preset
      </Text>

      <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="var(--azimuth-space-sm)">
        {presets.map((preset) => (
          <Card
            key={preset.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(preset.id)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(preset.id)
              }
            }}
            className={`${styles.card} ${selected === preset.id ? styles.selected : ''}`}
          >
            {preset.popular && (
              <Badge
                variant="accent"
                size="xs"
                style={{ position: 'absolute', top: 4, right: 8 }}
              >
                POPULAR
              </Badge>
            )}

            <div className={styles.icon}>{preset.icon}</div>

            <Text weight="semibold">{preset.name}</Text>

            <Text element={{ size: 'sm' }} className={styles.description}>
              {preset.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </fieldset>
  )
}
