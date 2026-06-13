import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateCors(config: BootConfig): GeneratedFile[] {
  if (!config.corsEnabled) return []
  return [
    {
      path: 'lib/cors.ts',
      content: `export const CORS_ORIGINS = (process.env.CORS_ORIGINS || "*").split(",").map(s => s.trim());

export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (CORS_ORIGINS[0] === "*") return { "Access-Control-Allow-Origin": "*" };
  if (origin && CORS_ORIGINS.includes(origin)) return { "Access-Control-Allow-Origin": origin };
  return {};
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
`,
    },
  ]
}

export function generateRateLimiting(config: BootConfig): GeneratedFile[] {
  if (config.rateLimiting === 'none') return []
  const isUpstash = config.rateLimiting === 'upstash'
  return [
    {
      path: 'lib/rate-limit.ts',
      content: isUpstash ? rateLimitUpstashContent : rateLimitMemoryContent,
    },
  ]
}

const rateLimitMemoryContent = `const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}, 60000);
`

const rateLimitUpstashContent = `import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const redis = new Redis({
  url: getEnv("UPSTASH_REDIS_URL"),
  token: getEnv("UPSTASH_REDIS_TOKEN"),
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});
`

export function generateRequestValidation(config: BootConfig): GeneratedFile[] {
  if (!config.requestValidation) return []
  return [
    {
      path: 'lib/validate.ts',
      content: `import { z } from "zod";

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
`,
    },
  ]
}

export function generateInputSanitization(config: BootConfig): GeneratedFile[] {
  if (!config.inputSanitization) return []
  return [
    {
      path: 'lib/sanitize.ts',
      content: `export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeSql(input: string): string {
  return input.replace(/['"\\\\\\0\\b\\n\\r\\t\\Z%_]/g, (char) => {
    return "\\\\" + char;
  });
}

export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

export function sanitizeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
}
`,
    },
  ]
}

export function generateSqliPrevention(config: BootConfig): GeneratedFile[] {
  if (!config.sqliPrevention) return []
  return [
    {
      path: 'docs/SQLI_PREVENTION.md',
      content: `# SQL Injection Prevention

## Parameterized Queries

All database queries MUST use parameterized queries (prepared statements). Never concatenate user input into SQL strings.

### Correct (parameterized)
\`\`\`ts
// PostgreSQL / Supabase
const { data } = await supabase.from("users").select("*").eq("email", userInput);

// Raw SQL with parameters
await db.query("SELECT * FROM users WHERE email = $1", [userInput]);
\`\`\`

### Wrong (string interpolation — DO NOT DO THIS)
\`\`\`ts
// ❌ Vulnerable to SQL injection
await db.query(\`SELECT * FROM users WHERE email = '\${userInput}'\`);
\`\`\`

## ORM / Query Builder Considerations

- Supabase JS client automatically parameterizes queries
- Drizzle ORM generates parameterized SQL
- Prisma uses parameterized queries internally
- Raw SQL must always use \`$1\`, \`$2\` parameter placeholders

## Testing

- Include SQL injection test cases in your security test suite
- Use tools like sqlmap for penetration testing
- Regular dependency scanning catches ORM vulnerabilities
`,
    },
  ]
}
