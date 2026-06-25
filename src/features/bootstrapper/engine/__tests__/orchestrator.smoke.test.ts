import { describe, it, expect } from 'vitest'
import { runGenerator } from './test-harness'

describe('orchestrator: end-to-end generation', () => {
  it('generates without throwing', () => {
    expect(() => runGenerator()).not.toThrow()
  })

  it('produces a non-empty file set', () => {
    const { files } = runGenerator()
    expect(files.length).toBeGreaterThan(0)
  })

  it('emits expected key files', () => {
    const { has } = runGenerator()
    const expected = [
      'package.json',
      'next.config.ts',
      'tsconfig.json',
      '.env.example',
      '.gitignore',
      'schema.sql',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'middleware.ts',
      'lib/supabase.ts',
      'lib/supabase-server.ts',
      'lib/db.ts',
      'lib/navigation.ts',
      'README.md',
      'AGENTS.md',
    ]
    for (const path of expected) {
      expect(has(path), `missing expected file: ${path}`).toBe(true)
    }
  })

  it('package.json is valid JSON with expected scripts', () => {
    const { read } = runGenerator()
    const pkg = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>
    }
    for (const script of ['dev', 'build', 'start', 'typecheck', 'lint', 'test']) {
      expect(
        pkg.scripts[script],
        `package.json missing script: ${script}`,
      ).toBeTypeOf('string')
    }
  })

  it('schema.sql contains expected tables', () => {
    const { read } = runGenerator()
    const schema = read('schema.sql')
    for (const table of ['users', 'audit_logs', 'api_keys', 'appointments']) {
      expect(
        schema,
        `schema.sql missing CREATE TABLE for ${table}`,
      ).toContain(`CREATE TABLE IF NOT EXISTS ${table}`)
    }
  })

  it('root layout wraps children in a client shell and ships a Supabase session client', () => {
    const { read } = runGenerator()
    const layout = read('src/app/layout.tsx')
    expect(layout).toContain('ClientShell')
    const clientShell = read('src/app/_components/client-shell.tsx')
    expect(clientShell).toContain('ThemeProvider')
    const supabaseServer = read('lib/supabase-server.ts')
    expect(supabaseServer).toContain('@supabase/ssr')
    expect(supabaseServer).toContain('createServerClient')
    const middleware = read('middleware.ts')
    expect(middleware).toContain('createServerClient')
  })

  it('generated package.json name matches the fixture project name', () => {
    const { read } = runGenerator()
    const pkg = JSON.parse(read('package.json')) as { name: string }
    expect(pkg.name).toBe('test-fixture-app')
  })

  it('does not emit duplicate paths', () => {
    const { paths } = runGenerator()
    expect(new Set(paths).size).toBe(paths.length)
  })
})