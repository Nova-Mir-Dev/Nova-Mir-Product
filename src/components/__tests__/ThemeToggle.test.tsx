import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'

vi.mock('azimuth-ui/icons', () => ({
  SunIcon: () => <svg data-testid="sun-icon" />,
  MoonIcon: () => <svg data-testid="moon-icon" />,
}))

const mockSetMode = vi.fn()

vi.mock('azimuth-ui', () => ({
  useThemeMode: () => ({
    mode: 'light',
    setMode: mockSetMode,
  }),
}))

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('toggles theme on click', () => {
    mockSetMode.mockClear()
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetMode).toHaveBeenCalledWith('dark')
  })

  it('renders with correct aria-label', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe(
      'Current theme: Light mode. Click to change.',
    )
  })
})
