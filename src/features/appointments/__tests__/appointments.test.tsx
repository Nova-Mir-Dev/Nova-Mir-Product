import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Appointments } from '../appointments'

const mockAppointments = [
  {
    id: '1',
    title: 'Consultation',
    description: 'Initial meeting',
    startTime: '2025-06-01T10:00:00Z',
    endTime: '2025-06-01T11:00:00Z',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Follow-up',
    startTime: '2025-06-15T14:00:00Z',
    endTime: '2025-06-15T15:00:00Z',
    status: 'confirmed',
  },
]

describe('Appointments', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve([]),
      ok: true,
    } as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders heading', () => {
    render(<Appointments />)
    expect(
      screen.getByRole('heading', { name: 'Appointments' }),
    ).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<Appointments />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument()
    expect(screen.getByLabelText('End Time')).toBeInTheDocument()
  })

  it('renders schedule button', () => {
    render(<Appointments />)
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument()
  })

  it('renders empty list by default', () => {
    render(<Appointments />)
    expect(screen.queryByText('Scheduled')).not.toBeInTheDocument()
  })

  it('renders with mock appointments', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockAppointments),
      ok: true,
    } as Response)

    render(<Appointments />)

    const scheduled = await screen.findByText('Scheduled')
    expect(scheduled).toBeInTheDocument()
    expect(screen.getByText(/Consultation/)).toBeInTheDocument()
    expect(screen.getByText(/Follow-up/)).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(<Appointments />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
