'use client'

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
    <button
      onClick={toggle}
      title={LABELS[mode]}
      aria-label={`Current theme: ${LABELS[mode]}. Click to change.`}
      style={{
        background: 'none',
        border: '1px solid var(--azimuth-color-border, #ccc)',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 20,
        lineHeight: 1,
        padding: '4px 8px',
        color: 'var(--azimuth-color-text, inherit)',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {ICONS[mode]}
    </button>
  )
}
