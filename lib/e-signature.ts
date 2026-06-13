import { createHash } from "node:crypto";

export interface ESignatureRequest {
  documentId: string;
  signerId: string;
  ipAddress?: string;
}

export function hashSignature(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

export function createSignaturePayload(request: ESignatureRequest): string {
  return JSON.stringify({
    documentId: request.documentId,
    signerId: request.signerId,
    timestamp: new Date().toISOString(),
  });
}

export function signDocument(request: ESignatureRequest): {
  payload: string;
  hash: string;
  timestamp: string;
} {
  const payload = createSignaturePayload(request);
  const hash = hashSignature(payload);
  return { payload, hash, timestamp: new Date().toISOString() };
}
