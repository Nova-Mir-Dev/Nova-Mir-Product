/** Strips unsafe characters from a filename. Max 255 chars, removes leading dots and consecutive dots. */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '_')
    .slice(0, 255)
}

/**
 * Builds a single PostgREST `ilike` "contains" clause (e.g. for `.or()`) with
 * the search term safely quoted. PostgREST treats `,` `(` `)` as structural and
 * `%` `_` as `LIKE` wildcards; double-quoting the value and escaping `"` `\`
 * `%` `_` stops a search term from injecting extra filter clauses or widening
 * the match, while leaving `.` intact so email searches still work.
 */
export function ilikeContainsClause(column: string, value: string): string {
  const term = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[%_]/g, '\\$&')
  return `${column}.ilike."%${term}%"`
}

/**
 * Builds a single PostgREST `eq` clause (e.g. for `.or()`) with the value
 * double-quoted so `,` `(` `)` in the value are treated literally rather than
 * as filter structure.
 */
export function eqClause(column: string, value: string): string {
  const term = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `${column}.eq."${term}"`
}

const SCRIPT_TAG = /<script[\s\S]*?<\/script>/gi
const ON_EVENT = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_PROTOCOL = /javascript:\s*/gi

/** Removes <script> tags, on* event handlers, and javascript: URIs from HTML. */
export function sanitizeHtml(input: string): string {
  return input
    .replace(SCRIPT_TAG, '')
    .replace(ON_EVENT, '')
    .replace(JAVASCRIPT_PROTOCOL, '')
}
