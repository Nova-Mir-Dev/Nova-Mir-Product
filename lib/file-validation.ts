const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  spreadsheet: ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

export function validateFile(file: File, allowedCategories: string[] = ["image"]): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  const allowedMimeTypes = allowedCategories.flatMap((cat) => ALLOWED_TYPES[cat] || []);
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed. Allowed: ${allowedMimeTypes.join(", ")}` };
  }

  return { valid: true };
}

export function validateFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
}
