import { describe, it, expect } from 'vitest'
import { runGenerator } from './test-harness'

describe('generator snapshot: .gitignore', () => {
  it('matches the expected fixed content', () => {
    const { read } = runGenerator()
    expect(read('.gitignore')).toMatchInlineSnapshot(
      `"node_modules/
.env
.env.local
.env.*.local
.next/
dist/
*.tsbuildinfo
.tmp/
coverage/
"`,
    )
  })
})