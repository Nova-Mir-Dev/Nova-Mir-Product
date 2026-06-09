import { createHash, randomBytes } from "node:crypto";

export function generateApiKey(): { prefix: string; hash: string } {
  const key = "ak_" + randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(key).digest("hex");
  return { prefix: key.slice(0, 8), hash };
}

export function validateApiKey(key: string, storedHash: string): boolean {
  const hash = createHash("sha256").update(key).digest("hex");
  return hash === storedHash;
}
