'use client'

import { IconButton } from 'azimuth-ui'
import { SunIcon, MoonIcon, CircleDotIcon } from 'azimuth-ui/icons'
import { useThemeMode } from 'azimuth-ui'

const ICONS: Record<string, React.ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <CircleDotIcon />,
}

const LABELS: Record<string, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode()

  function toggle() {
    if (mode === 'light') setMode('dark')
    else if (mode === 'dark') setMode('system')
    else setMode('light')
  }

  return (
    <IconButton
      icon={ICONS[mode]}
      onClick={toggle}
      aria-label={`Current theme: ${LABELS[mode]}. Click to change.`}
    />
  )
}
