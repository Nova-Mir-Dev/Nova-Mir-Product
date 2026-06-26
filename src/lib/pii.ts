export const PII_KEYS =
  /^(email|phone|name|full_name|first_name|last_name|message|address|ip|ip_address|password|token|access_token|refresh_token|secret|key|api_key|private_key|hash|ssn|dob|date_of_birth|birth|credit|card|cvv|authorization|cookie|user_agent|jwt)$/i

export function isPIIKey(key: string): boolean {
  return PII_KEYS.test(key)
}
