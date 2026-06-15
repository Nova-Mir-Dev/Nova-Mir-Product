/** Strips unsafe characters from a filename. Max 255 chars, removes leading dots and consecutive dots. */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '_')
    .slice(0, 255)
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
