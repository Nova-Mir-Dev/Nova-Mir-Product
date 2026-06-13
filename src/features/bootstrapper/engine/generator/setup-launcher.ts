import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateSetupLauncher(config: BootConfig): GeneratedFile[] {
  return [
    {
      path: 'scripts/start-setup.ts',
      content: `/**
 * Setup launcher — starts the dev server and opens the setup page.
 * Run: npm run setup
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const PORT = parseInt(process.env.PORT || "3000", 10);
const SETUP_URL = \`http://localhost:\${PORT}/setup\`;

console.log("\\n╔════════════════════════════════════════╗");
console.log("║     ${config.projectName} — Setup     ║");
console.log("╚════════════════════════════════════════╝\\n");
console.log("Starting development server...");

const dev = spawn("npx", ["next", "dev", "-p", String(PORT)], {
  stdio: "inherit",
  shell: true,
});

// Wait for server to start, then open browser
setTimeout(() => {
  const url = SETUP_URL;
  const platform = process.platform;
  const cmd =
    platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  spawn(cmd, [url], { stdio: "ignore", detached: true });
  console.log("\\nOpened setup page at " + url + "\\n");
  console.log("After setup is complete, run: npm run cleanup");
  console.log("This removes setup files and leaves a clean repo.\\n");
}, 4000);

process.on("SIGINT", () => {
  dev.kill();
  process.exit(0);
});

// Simple health check endpoint that the user can hit to verify
const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("ok");
  } else {
    res.writeHead(404);
    res.end();
  }
});
`,
    },
  ]
}
