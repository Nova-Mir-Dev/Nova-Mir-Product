/**
 * Validates all var(--azimuth-*) CSS custom property references in the
 * project against the known set defined by azimuth-ui.
 *
 * Run: npx tsx scripts/validate-azimuth-css-vars.ts
 *
 * Returns exit code 1 if any unknown variables are found.
 */

import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const KNOWN_VARS = new Set([
  '--azimuth-accent',
  '--azimuth-color-accent',
  '--azimuth-color-accent-hover',
  '--azimuth-color-accent-subtle',
  '--azimuth-color-bg',
  '--azimuth-color-border',
  '--azimuth-color-border-strong',
  '--azimuth-color-danger',
  '--azimuth-color-error-bg',
  '--azimuth-color-error-text',
  '--azimuth-color-info-bg',
  '--azimuth-color-info-text',
  '--azimuth-color-on-accent',
  '--azimuth-color-on-primary',
  '--azimuth-color-overlay',
  '--azimuth-color-primary',
  '--azimuth-color-primary-hover',
  '--azimuth-color-primary-ring',
  '--azimuth-color-primary-subtle',
  '--azimuth-color-success-bg',
  '--azimuth-color-success-text',
  '--azimuth-color-surface',
  '--azimuth-color-surface-hover',
  '--azimuth-color-text',
  '--azimuth-color-text-inverse',
  '--azimuth-color-text-muted',
  '--azimuth-color-text-secondary',
  '--azimuth-color-warning-bg',
  '--azimuth-color-warning-text',
  '--azimuth-ease',
  '--azimuth-font-body',
  '--azimuth-font-display',
  '--azimuth-font-mono',
  '--azimuth-fs-2xl',
  '--azimuth-fs-base',
  '--azimuth-fs-h1',
  '--azimuth-fs-h2',
  '--azimuth-fs-h3',
  '--azimuth-fs-h4',
  '--azimuth-fs-h5',
  '--azimuth-fs-h6',
  '--azimuth-fs-lg',
  '--azimuth-fs-sm',
  '--azimuth-fs-xl',
  '--azimuth-fs-xs',
  '--azimuth-lh-base',
  '--azimuth-lh-display',
  '--azimuth-lh-heading',
  '--azimuth-lh-tight',
  '--azimuth-radius',
  '--azimuth-radius-full',
  '--azimuth-radius-lg',
  '--azimuth-radius-md',
  '--azimuth-radius-none',
  '--azimuth-radius-sm',
  '--azimuth-radius-xl',
  '--azimuth-shadow-focus',
  '--azimuth-shadow-focus-error',
  '--azimuth-shadow-lg',
  '--azimuth-shadow-md',
  '--azimuth-shadow-sm',
  '--azimuth-space-2xl',
  '--azimuth-space-3xl',
  '--azimuth-space-4xl',
  '--azimuth-space-lg',
  '--azimuth-space-md',
  '--azimuth-space-sm',
  '--azimuth-space-xl',
  '--azimuth-space-xs',
  '--azimuth-transition-base',
  '--azimuth-transition-fast',
])

const IGNORE_PATTERNS = ['node_modules', '.next', '.turbo', 'coverage']

function findFiles(): string[] {
  const result = execSync(
    "find src -type f \\( -name '*.css' -o -name '*.tsx' -o -name '*.ts' \\)",
    { encoding: 'utf-8' },
  )
  return result.trim().split('\n').filter(Boolean)
}

function extractVarRefs(content: string): string[] {
  const regex = /var\((--azimuth-[^)\s,]+)/g
  const refs: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    refs.push(match[1]!)
  }
  return refs
}

function main() {
  const files = findFiles()
  let errors = 0

  for (const file of files) {
    if (IGNORE_PATTERNS.some((p) => file.includes(p))) continue

    const content = readFileSync(file, 'utf-8')
    const refs = extractVarRefs(content)

    for (const ref of refs) {
      if (!KNOWN_VARS.has(ref)) {
        console.error(`[ERROR] ${file}: unknown Azimuth CSS variable "${ref}"`)
        errors++
      }
    }
  }

  if (errors > 0) {
    console.error(`\n✗ ${errors} unknown Azimuth CSS variable(s) found.`)
    process.exit(1)
  }

  console.log('✓ All var(--azimuth-*) references are valid.')
}

main()
