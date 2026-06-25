import { z } from 'zod'

export const bridgeRequestSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
})

export interface BridgeError {
  code: string
  message: string
}
