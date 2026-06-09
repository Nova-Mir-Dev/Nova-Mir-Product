// File access control utilities

export type AccessLevel = "public" | "authenticated" | "owner" | "admin";

interface FileAccess {
  filePath: string;
  accessLevel: AccessLevel;
  allowedUserIds?: string[];
}

export function canAccessFile(
  file: FileAccess,
  userId: string | null,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (file.accessLevel === "public") return true;
  if (file.accessLevel === "authenticated" && userId) return true;
  if (file.accessLevel === "owner" && file.allowedUserIds?.includes(userId || "")) return true;
  return false;
}

export function getAccessLevel(isPublic: boolean, isAuthenticated: boolean): AccessLevel {
  if (isPublic) return "public";
  if (isAuthenticated) return "authenticated";
  return "owner";
}
