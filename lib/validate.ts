import { z } from "zod";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}

export class ValidationError extends Error {
  public issues: z.ZodIssue[];
  constructor(issues: z.ZodIssue[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(128);
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
