const ALLOWED_IPS = (process.env.ALLOWED_IPS || "").split(",").map(s => s.trim()).filter(Boolean);

export function isIpAllowed(ip: string): boolean {
  if (ALLOWED_IPS.length === 0) return true;
  return ALLOWED_IPS.some(
    (allowed) => allowed === ip || (allowed.endsWith("*") && ip.startsWith(allowed.slice(0, -1)))
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}
