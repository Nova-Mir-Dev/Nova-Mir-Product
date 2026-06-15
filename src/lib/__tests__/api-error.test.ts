import { describe, it, expect } from 'vitest'
import {
  apiError,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  rateLimited,
  internalError,
} from '../api-error'

describe('apiError', () => {
  it('returns a JSON response with error and code', () => {
    const response = apiError('Test error', 'VALIDATION_ERROR', 400)
    expect(response.status).toBe(400)
    expect(response.headers.get('content-type')).toContain('application/json')
  })

  it('returns correct body', async () => {
    const response = apiError('Something went wrong', 'INTERNAL_ERROR', 500)
    const body = await response.json()
    expect(body).toEqual({
      error: 'Something went wrong',
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('unauthorized', () => {
  it('returns 401 with default message', async () => {
    const response = unauthorized()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
  })

  it('returns 401 with custom message', async () => {
    const response = unauthorized('Custom auth message')
    const body = await response.json()
    expect(body).toEqual({ error: 'Custom auth message', code: 'UNAUTHORIZED' })
  })
})

describe('forbidden', () => {
  it('returns 403 with default message', async () => {
    const response = forbidden()
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body).toEqual({ error: 'Forbidden', code: 'FORBIDDEN' })
  })
})

describe('notFound', () => {
  it('returns 404 with default message', async () => {
    const response = notFound()
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ error: 'Not found', code: 'NOT_FOUND' })
  })
})

describe('validationError', () => {
  it('returns 400 with provided message', async () => {
    const response = validationError('Name is required')
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({
      error: 'Name is required',
      code: 'VALIDATION_ERROR',
    })
  })
})

describe('rateLimited', () => {
  it('returns 429 with default message', async () => {
    const response = rateLimited()
    expect(response.status).toBe(429)
    const body = await response.json()
    expect(body).toEqual({ error: 'Too many requests', code: 'RATE_LIMITED' })
  })
})

describe('internalError', () => {
  it('returns 500 with default message', async () => {
    const response = internalError()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
