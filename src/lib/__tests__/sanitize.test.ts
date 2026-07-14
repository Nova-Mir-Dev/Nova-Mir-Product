import { describe, it, expect } from 'vitest'
import { sanitizeFilename, ilikeContainsClause, eqClause } from '../sanitize'

describe('sanitizeFilename', () => {
  it('preserves safe filenames', () => {
    expect(sanitizeFilename('document.pdf')).toBe('document.pdf')
    expect(sanitizeFilename('my-file_v2.0.txt')).toBe('my-file_v2.0.txt')
  })

  it('replaces unsafe characters with underscores', () => {
    expect(sanitizeFilename('hello world')).toBe('hello_world')
    expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt')
    expect(sanitizeFilename('a|b?c*d:e.txt')).toBe('a_b_c_d_e.txt')
  })

  it('collapses multiple dots into one', () => {
    expect(sanitizeFilename('file..name.txt')).toBe('file.name.txt')
    expect(sanitizeFilename('a...b.txt')).toBe('a.b.txt')
  })

  it('replaces leading dot with underscore', () => {
    expect(sanitizeFilename('.hidden')).toBe('_hidden')
    expect(sanitizeFilename('..file')).toBe('_file')
  })

  it('truncates to 255 characters', () => {
    const long = 'a'.repeat(300) + '.txt'
    const result = sanitizeFilename(long)
    expect(result.length).toBeLessThanOrEqual(255)
  })

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('')
  })
})

describe('ilikeContainsClause', () => {
  it('wraps a plain term in a quoted contains pattern', () => {
    expect(ilikeContainsClause('name', 'acme')).toBe('name.ilike."%acme%"')
  })

  it('keeps dots intact for email search', () => {
    expect(ilikeContainsClause('email', 'a.b@x.com')).toBe(
      'email.ilike."%a.b@x.com%"',
    )
  })

  it('neutralizes PostgREST structural characters so extra clauses cannot be injected', () => {
    const clause = ilikeContainsClause('name', 'x",status.eq.won,("')
    expect(clause.startsWith('name.ilike."%')).toBe(true)
    expect(clause.endsWith('%"')).toBe(true)
    // the injected quote is escaped, so it cannot close the value early
    expect(clause).toContain('\\"')
  })

  it('escapes LIKE wildcards so they match literally', () => {
    expect(ilikeContainsClause('name', '100%_off')).toBe(
      'name.ilike."%100\\%\\_off%"',
    )
  })
})

describe('eqClause', () => {
  it('double-quotes the value', () => {
    expect(eqClause('email', 'a@b.com')).toBe('email.eq."a@b.com"')
  })

  it('escapes quotes and backslashes to prevent clause injection', () => {
    expect(eqClause('name', 'a",x.eq.y')).toBe('name.eq."a\\",x.eq.y"')
  })
})
