'use client'

import { useThemeMode } from 'azimuth-ui'

const ICONS: Record<string, string> = {
  light: '\u2600\uFE0F',
  dark: '\uD83C\uDF19',
  system: '\uD83D\uDDBB\uFE0F',
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
      title={mode === 'system' ? 'System theme' : mode === 'light' ? 'Light mode' : 'Dark mode'}
      aria-label={`Current theme: ${mode}. Click to change.`}
      style={{
        background: 'none',
        border: '1px solid var(--azimuth-color-border, #ccc)',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1,
        padding: '4px 8px',
        color: 'var(--azimuth-color-text, inherit)',
      }}
    >
      {ICONS[mode]}
    </button>
  )
}
