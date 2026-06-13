import { describe, it, expect } from 'vitest'
import { sanitizeFilename } from '../sanitize'

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
