import { describe, it, expect } from 'vitest'
import { createAppointmentSchema, appointmentStatusSchema } from '../schemas'

describe('appointmentStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(appointmentStatusSchema.safeParse('scheduled').success).toBe(true)
    expect(appointmentStatusSchema.safeParse('confirmed').success).toBe(true)
    expect(appointmentStatusSchema.safeParse('cancelled').success).toBe(true)
    expect(appointmentStatusSchema.safeParse('completed').success).toBe(true)
  })

  it('rejects invalid status', () => {
    expect(appointmentStatusSchema.safeParse('pending').success).toBe(false)
    expect(appointmentStatusSchema.safeParse('unknown').success).toBe(false)
  })
})

describe('createAppointmentSchema', () => {
  const validAppointment = {
    title: 'Consultation',
    description: 'Initial meeting',
    startTime: '2025-06-01T10:00:00Z',
    endTime: '2025-06-01T11:00:00Z',
  }

  it('passes with valid data', () => {
    const result = createAppointmentSchema.safeParse(validAppointment)
    expect(result.success).toBe(true)
  })

  it('passes with no description', () => {
    const result = createAppointmentSchema.safeParse({
      title: 'Consultation',
      startTime: '2025-06-01T10:00:00Z',
      endTime: '2025-06-01T11:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('fails when title is empty', () => {
    const result = createAppointmentSchema.safeParse({
      ...validAppointment,
      title: '',
    })
    expect(result.success).toBe(false)
  })

  it('fails when title exceeds 200 chars', () => {
    const result = createAppointmentSchema.safeParse({
      ...validAppointment,
      title: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('fails when startTime is empty', () => {
    const result = createAppointmentSchema.safeParse({
      ...validAppointment,
      startTime: '',
    })
    expect(result.success).toBe(false)
  })

  it('fails when endTime is empty', () => {
    const result = createAppointmentSchema.safeParse({
      ...validAppointment,
      endTime: '',
    })
    expect(result.success).toBe(false)
  })

  it('defaults description to null when not provided', () => {
    const result = createAppointmentSchema.safeParse({
      title: 'Consultation',
      startTime: '2025-06-01T10:00:00Z',
      endTime: '2025-06-01T11:00:00Z',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('accepts empty description as empty string', () => {
    const result = createAppointmentSchema.safeParse({
      ...validAppointment,
      description: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('')
    }
  })
})
