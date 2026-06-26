import { z } from 'zod'

/**
 * Zod schema for validating bridge request payloads.
 * Both fields are optional — callers send only what they need.
 */
export const bridgeRequestSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
})

/**
 * Standard error shape returned by bridge endpoints.
 * `code` is a machine-readable error code (e.g. `INVALID_API_KEY`).
 * `message` is a human-readable description safe to return to the caller.
 */
export interface BridgeError {
  code: string
  message: string
}
