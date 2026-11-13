export function credentials(input: { email: unknown; password: unknown }) {
  const { email, password } = input;
  if (typeof email !== "string" || typeof password !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
      || password.length < 12 || password.length > 128) return null;
  return { email: normalized, password };
}
