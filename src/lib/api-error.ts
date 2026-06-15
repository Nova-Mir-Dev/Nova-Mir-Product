import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export interface ApiError {
  error: string
  code: ApiErrorCode
}

export function apiError(message: string, code: ApiErrorCode, status: number) {
  return NextResponse.json({ error: message, code } satisfies ApiError, {
    status,
  })
}

export function unauthorized(message = 'Unauthorized') {
  return apiError(message, 'UNAUTHORIZED', 401)
}

export function forbidden(message = 'Forbidden') {
  return apiError(message, 'FORBIDDEN', 403)
}

export function notFound(message = 'Not found') {
  return apiError(message, 'NOT_FOUND', 404)
}

export function validationError(message: string) {
  return apiError(message, 'VALIDATION_ERROR', 400)
}

export function rateLimited(message = 'Too many requests') {
  return apiError(message, 'RATE_LIMITED', 429)
}

export function internalError(message = 'Internal server error') {
  return apiError(message, 'INTERNAL_ERROR', 500)
}
