import type { GeneratedFile } from './types'

export function generateCleanupSetup(): GeneratedFile[] {
  return [
    {
      path: 'scripts/cleanup-setup.ts',
      content: `#!/usr/bin/env node
/**
 * Cleanup script — removes setup files after configuration is complete.
 * Run: npm run cleanup
 *
 * This removes:
 *   - scripts/setup.ts
 *   - scripts/start-setup.ts
 *   - scripts/cleanup-setup.ts (itself)
 *   - src/app/setup/
 *   - "setup" and "cleanup" scripts from package.json
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();

const toRemove = [
  "scripts/setup.ts",
  "scripts/start-setup.ts",
  "src/app/setup",
];

for (const relative of toRemove) {
  const full = path.join(ROOT, relative);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log("  Removed " + relative);
  }
}

// Remove setup and cleanup scripts from package.json
const pkgPath = path.join(ROOT, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (pkg.scripts) {
    delete pkg.scripts.setup;
    delete pkg.scripts.cleanup;
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\\n");
  console.log("  Removed setup/cleanup scripts from package.json");
}

// Delete self
const selfPath = path.join(ROOT, "scripts/cleanup-setup.ts");
if (fs.existsSync(selfPath)) {
  fs.rmSync(selfPath);
}

console.log("\\nDone! Setup files removed. Your project is ready.\\n");
`,
    },
  ]
}
