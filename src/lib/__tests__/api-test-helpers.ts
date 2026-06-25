import { vi } from 'vitest'

/**
 * Test fixtures and chainable-mock builders for API route integration tests.
 *
 * The mocks here reconstruct just enough of a Supabase client to drive the
 * real route handlers: `auth.getUser()` for session resolution and a chainable
 * `from(table).select().eq().single()` style proxy for the query builder.
 */

export interface RouteUser {
  id: string
  email: string
  user_metadata?: Record<string, unknown>
}

export interface TableResult {
  data?: unknown
  error?: unknown
  count?: number | null
}

export interface TableOps {
  select?: TableResult
  selectCount?: TableResult
  insert?: TableResult
  update?: TableResult
  delete?: TableResult
}

export interface MfaResult {
  enroll?: { data?: unknown; error?: unknown }
  challenge?: { data?: unknown; error?: unknown }
  verify?: { data?: unknown; error?: unknown }
  listFactors?: { data?: unknown; error?: unknown }
  unenroll?: { data?: unknown; error?: unknown }
}

export interface MockClientOptions {
  user?: RouteUser | null
  authError?: unknown | null
  mfa?: MfaResult
  tables?: Record<string, TableOps>
}

export const unauthUser = null

export const adminUser: RouteUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  user_metadata: { full_name: 'Admin User' },
}

export const clientUser: RouteUser = {
  id: 'client-1',
  email: 'client@example.com',
  user_metadata: { full_name: 'Client User' },
}

export const adminProfile = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
}

export const clientProfile = {
  id: 'client-1',
  email: 'client@example.com',
  name: 'Client User',
  role: 'viewer',
}

type OpCode = keyof TableOps | undefined

function buildQuery(table: string, tables?: Record<string, TableOps>) {
  let op: OpCode = undefined

  const resolve = (): TableResult => {
    const ops = tables?.[table]
    if (!ops) return { data: null, error: null, count: null }
    if (op && ops[op]) return ops[op]!
    if (ops.select) return ops.select
    return { data: null, error: null, count: null }
  }

  const chainResult = (): TableResult => ({
    data: resolve().data ?? null,
    error: resolve().error ?? null,
    count: resolve().count ?? null,
  })

  const chain: Record<string, unknown> = {
    select: vi.fn((...args: unknown[]) => {
      const opts = args[1] as { count?: string } | undefined
      const nextOp = opts?.count === 'exact' ? 'selectCount' : 'select'
      if (op === undefined || op === 'select' || op === 'selectCount') {
        op = nextOp
      }
      return chain
    }),
    insert: vi.fn(() => {
      op = 'insert'
      return chain
    }),
    upsert: vi.fn(() => {
      op = 'insert'
      return chain
    }),
    update: vi.fn(() => {
      op = 'update'
      return chain
    }),
    delete: vi.fn(() => {
      op = 'delete'
      return chain
    }),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    and: vi.fn(() => chain),
    not: vi.fn(() => chain),
    in: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    gt: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    like: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    range: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(chainResult())),
    maybeSingle: vi.fn(() => Promise.resolve(chainResult())),
  }

  Object.defineProperty(chain, 'then', {
    value: (
      resolve?: (v: TableResult) => void,
      reject?: (e: unknown) => void,
    ) => Promise.resolve(chainResult()).then(resolve, reject),
    enumerable: false,
    configurable: true,
  })

  return chain
}

export interface MockClient {
  auth: {
    getUser: () => Promise<{
      data: { user: RouteUser | null }
      error: { message?: string } | null
    }>
    mfa: {
      enroll: (
        ...args: unknown[]
      ) => Promise<{ data?: unknown; error?: unknown }>
      challenge: (
        ...args: unknown[]
      ) => Promise<{ data?: unknown; error?: unknown }>
      verify: (
        ...args: unknown[]
      ) => Promise<{ data?: unknown; error?: unknown }>
      listFactors: (
        ...args: unknown[]
      ) => Promise<{ data?: unknown; error?: unknown }>
      unenroll: (
        ...args: unknown[]
      ) => Promise<{ data?: unknown; error?: unknown }>
    }
  }
  from: (table: string) => ReturnType<typeof buildQuery>
}

/**
 * Builds a Supabase client mock for use in route tests. The mock supports the
 * subset of `auth.getUser()` / `from(table).{select,insert,update,delete}`
 * chaining the API routes actually perform.
 */
export function createMockClient(opts: MockClientOptions = {}): MockClient {
  const user = opts.user === undefined ? null : opts.user
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user },
        error: opts.authError ?? null,
      })),
      mfa: {
        enroll: vi.fn(async (p?: unknown) => {
          void p
          return (
            opts.mfa?.enroll ?? {
              data: {
                id: 'factor-1',
                totp: {
                  qr_code: 'qr-code',
                  secret: 'secret',
                  uri: 'otpauth://...',
                },
              },
              error: null,
            }
          )
        }),
        challenge: vi.fn(async (p?: unknown) => {
          void p
          return (
            opts.mfa?.challenge ?? { data: { id: 'challenge-1' }, error: null }
          )
        }),
        verify: vi.fn(async (p?: unknown) => {
          void p
          return opts.mfa?.verify ?? { data: {}, error: null }
        }),
        listFactors: vi.fn(async (p?: unknown) => {
          void p
          return opts.mfa?.listFactors ?? { data: [], error: null }
        }),
        unenroll: vi.fn(async (p?: unknown) => {
          void p
          return opts.mfa?.unenroll ?? { data: {}, error: null }
        }),
      },
    },
    from: vi.fn((table: string) => buildQuery(table, opts.tables)),
  } as MockClient
}

export interface BuildRequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Builds a real {@link Request} for a route handler invocation. JSON bodies are
 * stringified with the default application/json content-type unless overridden.
 */
export function buildRequest(
  url: string,
  opts: BuildRequestOptions = {},
): Request {
  const headers = new Headers(opts.headers)
  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }
  }
  return new Request(url, {
    method: opts.method ?? 'GET',
    headers,
    body,
  })
}

export const JSON_CT = { 'content-type': 'application/json' }
