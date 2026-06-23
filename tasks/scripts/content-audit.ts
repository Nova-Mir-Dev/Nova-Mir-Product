import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()

function read(path: string): string | null {
  try {
    return readFileSync(join(ROOT, path), 'utf-8')
  } catch {
    return null
  }
}

function findFiles(dir: string, pattern: RegExp, results: string[] = []): string[] {
  try {
    const entries = readdirSync(join(ROOT, dir))
    for (const entry of entries) {
      const full = join(ROOT, dir, entry)
      const rel = join(dir, entry)
      if (statSync(full).isDirectory() && !entry.startsWith('__')) {
        findFiles(rel, pattern, results)
      } else if (pattern.test(entry)) {
        results.push(rel)
      }
    }
  } catch {
    // Directory may not exist or be readable — skip silently
  }
  return results
}



interface ContentType {
  name: string
  table: string
  source: string
  status: 'present' | 'missing'
}

const CONTENT_TYPES: ContentType[] = [
  { name: 'Pricing tiers', table: 'pricing_tiers', source: 'src/lib/pricing.ts', status: 'missing' },
  { name: 'Portfolio projects', table: 'portfolio_projects', source: 'page.tsx, portfolio/page.tsx', status: 'missing' },
  { name: 'Public nav links', table: 'public_nav_links', source: 'src/lib/navigation.ts, client-shell.tsx', status: 'missing' },
  { name: 'Hero headlines', table: 'hero_headlines', source: 'page.tsx (hero section)', status: 'missing' },
  { name: 'Testimonials', table: 'testimonials', source: 'page.tsx (placeholders)', status: 'missing' },
  { name: 'Process steps', table: 'process_steps', source: 'page.tsx, process/page.tsx, about/page.tsx', status: 'missing' },
]

function auditContentTables(schema: string | null): ContentType[] {
  if (!schema) return CONTENT_TYPES

  for (const ct of CONTENT_TYPES) {
    if (schema.includes(`CREATE TABLE IF NOT EXISTS ${ct.table}`)) {
      ct.status = 'present'
    }
  }

  return CONTENT_TYPES
}

// ---------------------------------------------------------------------------
// 2. Anti-patterns
// ---------------------------------------------------------------------------

interface AntiPattern {
  check: string
  pass: boolean
  detail: string
}

function auditAntiPatterns(schema: string | null, seed: string | null): AntiPattern[] {
  const results: AntiPattern[] = []

  // Check for generic JSONB content table
  if (schema && /CREATE TABLE IF NOT EXISTS content\s*\(/i.test(schema)) {
    results.push({
      check: 'Generic JSONB content table',
      pass: false,
      detail: 'Found generic content table — should use typed tables',
    })
  } else {
    results.push({
      check: 'Generic JSONB content table',
      pass: true,
      detail: 'No generic content table found',
    })
  }

  // Deferred tables should have no seed data
  const deferredTables = ['testimonials', 'process_steps']
  for (const table of deferredTables) {
    if (seed && seed.includes(`INSERT INTO ${table}`)) {
      results.push({
        check: `Seed data for deferred table "${table}"`,
        pass: false,
        detail: `Found INSERT INTO ${table} in seed-content.sql — deferred tables should have no seed data until ready`,
      })
    } else {
      results.push({
        check: `Seed data for deferred table "${table}"`,
        pass: true,
        detail: `No seed data for ${table} — correct (deferred)`,
      })
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// 3. DSAR Completeness Audit
// ---------------------------------------------------------------------------

interface UserDataTable {
  name: string
  has_user_id: boolean
  id_field: string
  covered_access: boolean
  covered_deletion: boolean
}

const USER_DATA_TABLES: UserDataTable[] = [
  { name: 'users', has_user_id: true, id_field: 'id', covered_access: false, covered_deletion: false },
  { name: 'sessions', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'projects', has_user_id: true, id_field: 'client_id', covered_access: false, covered_deletion: false },
  { name: 'appointments', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'payments', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'documents', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'api_keys', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'support_tickets', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'signatures', has_user_id: true, id_field: 'signer_id', covered_access: false, covered_deletion: false },
  { name: 'activity_logs', has_user_id: true, id_field: 'user_id', covered_access: false, covered_deletion: false },
  { name: 'leads', has_user_id: false, id_field: 'email', covered_access: false, covered_deletion: false },
  { name: 'portfolio_clients', has_user_id: false, id_field: 'email', covered_access: false, covered_deletion: false },
]

function auditDSAR(accessRoute: string | null, deletionRoute: string | null): UserDataTable[] {
  for (const tbl of USER_DATA_TABLES) {
    if (accessRoute && accessRoute.includes(`'${tbl.name}'`)) {
      tbl.covered_access = true
    }
    if (deletionRoute && deletionRoute.includes(`'${tbl.name}'`)) {
      tbl.covered_deletion = true
    }
  }
  return USER_DATA_TABLES
}

// ---------------------------------------------------------------------------
// 4. Orphaned Component Check
// ---------------------------------------------------------------------------

interface OrphanedComponent {
  file: string
  exportName: string
}

function findOrphanedComponents(): OrphanedComponent[] {
  const orphans: OrphanedComponent[] = []
  const featureFiles = findFiles('src/features', /\.tsx$/)

  // Collect all src/ files for cross-reference (non-test, non-self)
  const allSrcFiles: { path: string; content: string }[] = []
  for (const dir of ['src/app', 'src/features']) {
    const files = findFiles(dir, /\.(tsx|ts)$/)
    for (const f of files) {
      if (f.includes('/__tests__/') || f.endsWith('.test.tsx') || f.endsWith('.spec.tsx')) continue
      allSrcFiles.push({ path: f, content: readFileSync(join(ROOT, f), 'utf-8') })
    }
  }

  for (const file of featureFiles) {
    if (file.includes('/__tests__/') || file.endsWith('.test.tsx') || file.endsWith('.spec.tsx')) {
      continue
    }

    const content = readFileSync(join(ROOT, file), 'utf-8')

    const defaultExportMatch = content.match(/export default function\s+(\w+)/)
    if (!defaultExportMatch) continue

    const exportName = defaultExportMatch[1]!

    // Check if this file is imported by any other src/ file
    let found = false
    for (const other of allSrcFiles) {
      if (other.path === file) continue
      const otherContent: string = other.content
      if (otherContent.includes(exportName) || otherContent.includes(file)) {
        found = true
        break
      }
    }

    if (!found) {
      orphans.push({ file, exportName })
    }
  }

  return orphans
}

// ---------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------

function report(contentTypes: ContentType[], antiPatterns: AntiPattern[], dsarTables: UserDataTable[], orphans: OrphanedComponent[]) {
  const header = '═'.repeat(55)
  console.log('')
  console.log(header)
  console.log('  CONTENT ARCHITECTURE + DSAR AUDIT REPORT')
  console.log(header)
  console.log('')

  // Content tables
  console.log('CONTENT TABLES:')
  console.log('')
  for (const ct of contentTypes) {
    const icon = ct.status === 'present' ? '✓' : '✗'
    const status = ct.status === 'present' ? 'present in schema.sql' : 'MISSING from schema.sql'
    console.log(`  ${icon} ${ct.table} — ${status}`)
  }

  // Anti-patterns
  console.log('')
  console.log('ANTI-PATTERNS:')
  console.log('')
  for (const ap of antiPatterns) {
    const icon = ap.pass ? '✓' : '✗'
    console.log(`  ${icon} ${ap.check}`)
    console.log(`       ${ap.detail}`)
  }

  // DSAR coverage
  console.log('')
  console.log('DSAR COVERAGE:')
  console.log('')
  for (const tbl of dsarTables) {
    const icon = tbl.covered_access && tbl.covered_deletion ? '✓' : '✗'
    const accessStatus = tbl.covered_access ? 'COVERED' : 'MISSING'
    const deletionStatus = tbl.covered_deletion ? 'COVERED' : 'MISSING'
    const idField = tbl.has_user_id ? ` (via ${tbl.id_field})` : ` (via ${tbl.id_field}, no user_id)`
    console.log(`  ${icon} ${tbl.name}${idField}`)
    console.log(`       data-access: ${accessStatus}, data-deletion: ${deletionStatus}`)
  }

  // Orphaned components
  console.log('')
  console.log('ORPHANED COMPONENTS:')
  console.log('')
  if (orphans.length === 0) {
    console.log('  ✓ No orphaned components found')
  } else {
    for (const orphan of orphans) {
      console.log(`  ✗ ${orphan.file}`)
      console.log(`       export: ${orphan.exportName}`)
    }
  }

  // Summary
  const contentPresent = contentTypes.filter(c => c.status === 'present').length
  const contentTotal = contentTypes.length
  const dsarAccessCovered = dsarTables.filter(t => t.covered_access).length
  const dsarDeletionCovered = dsarTables.filter(t => t.covered_deletion).length
  const dsarTotal = dsarTables.length
  const antiPatternFails = antiPatterns.filter(a => !a.pass).length

  console.log('')
  console.log('SUMMARY:')
  console.log('')
  console.log(`  Content tables: ${contentPresent}/${contentTotal} present`)
  console.log(`  DSAR access: ${dsarAccessCovered}/${dsarTotal} covered`)
  console.log(`  DSAR deletion: ${dsarDeletionCovered}/${dsarTotal} covered`)
  console.log(`  Anti-patterns: ${antiPatternFails} issue(s)`)
  console.log(`  Orphaned components: ${orphans.length}`)
  console.log('')

  // Determine exit code
  const allContentPresent = contentPresent === contentTotal
  const allDSARCovered = dsarAccessCovered === dsarTotal && dsarDeletionCovered === dsarTotal
  const noIssues = allContentPresent && allDSARCovered && antiPatternFails === 0 && orphans.length === 0

  return noIssues ? 0 : 1
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const schema = read('schema.sql')
  const accessRoute = read('src/app/api/compliance/data-access/route.ts')
  const deletionRoute = read('src/app/api/compliance/data-deletion/route.ts')
  const seedContent = read('supabase/seed-content.sql')

  if (!schema) {
    console.error('FATAL: schema.sql not found at project root')
    process.exit(1)
  }

  const contentTypes = auditContentTables(schema)
  const antiPatterns = auditAntiPatterns(schema, seedContent)
  const dsarTables = auditDSAR(accessRoute, deletionRoute)
  const orphans = findOrphanedComponents()

  const code = report(contentTypes, antiPatterns, dsarTables, orphans)
  process.exit(code)
}

main()
