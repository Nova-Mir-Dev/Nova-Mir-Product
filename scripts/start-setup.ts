/**
 * Setup launcher — starts the dev server and opens the setup page.
 * Run: npm run setup
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const PORT = parseInt(process.env.PORT || "3000", 10);
const SETUP_URL = `http://localhost:${PORT}/setup`;

console.log("\n╔════════════════════════════════════════╗");
console.log("║     nova-mir-product — Setup     ║");
console.log("╚════════════════════════════════════════╝\n");
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
  console.log("\nOpened setup page at " + url + "\n");
  console.log("When setup is complete, you can remove this script");
  console.log("and the src/app/setup/ directory.\n");
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
