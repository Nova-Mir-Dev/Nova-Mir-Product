import { existsSync } from 'fs'
import { join } from 'path'

const EXPECTED_FILES = [
  '/nova-mir-simple.svg',
  '/og-image.svg',
  '/favicon.ico',
  '/manifest.webmanifest',
]

function main() {
  const publicDir = join(process.cwd(), 'public')
  const missing: string[] = []

  for (const file of EXPECTED_FILES) {
    const fullPath = join(publicDir, file)
    if (!existsSync(fullPath)) {
      console.error(`Missing: public${file}`)
      missing.push(file)
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n${missing.length} public asset(s) missing. Expected files:`,
    )
    for (const f of EXPECTED_FILES) {
      console.error(`  - public${f}`)
    }
    process.exit(1)
  }

  console.log('All public assets present.')
  process.exit(0)
}

main()
