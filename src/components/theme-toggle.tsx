'use client'

import { SunIcon, MoonIcon } from 'azimuth-ui/icons'
import { useThemeMode } from 'azimuth-ui'

function MonitorIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <MonitorIcon />,
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
