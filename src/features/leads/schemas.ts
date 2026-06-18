import { z } from 'zod'

/** Valid lead statuses in the pipeline. */
export const leadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost',
])

/** Schema for creating a new lead from the public contact form. Requires consent. */
export const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Invalid email address').max(254),
  businessName: z.string().trim().min(1, 'Business name is required').max(200),
  phone: z.string().trim().max(50).optional().nullable().default(null),
  serviceInterest: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .default(null),
  budgetRange: z.string().trim().max(100).optional().nullable().default(null),
  timeline: z.string().trim().max(100).optional().nullable().default(null),
  referralSource: z.string().trim().max(200).optional().nullable().default(null),
  currentWebsite: z.string().trim().max(500).optional().nullable().default(null),
  message: z.string().trim().min(1, 'Message is required').max(10000),
  consent: z.literal(true, {
    message: 'You must consent to data storage before submitting.',
  }),
})

/** Schema for updating a lead's status. */
export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
})
