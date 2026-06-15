'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode
  document.documentElement.setAttribute('data-theme', resolved)
}

const ICONS: Record<ThemeMode, string> = {
  light: '\u2600\uFE0F',
  dark: '\uD83C\uDF19',
  system: '\uD83D\uDDBB\uFE0F',
}

const LABELS: Record<ThemeMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    setMode(getStoredMode())
  }, [])

  function toggle() {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const current = getStoredMode()
    const next = modes[(modes.indexOf(current) + 1) % modes.length]!
    localStorage.setItem('theme-mode', next)
    applyTheme(next)
    setMode(next)
  }

  return (
    <button
      onClick={toggle}
      title={LABELS[mode]}
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
