import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "@/lib/db";

const cookieName = "santa_session";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await database().query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash(token), userId, expires],
  );
  (await cookies()).set(cookieName, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", expires,
  });
}

export async function currentUser(): Promise<{ id: string; email: string } | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await database().query<{ id: string; email: string }>(
    `SELECT u.id, u.email FROM users u JOIN sessions s ON s.user_id = u.id
     WHERE s.token_hash = $1 AND s.expires_at > now()`, [tokenHash(token)],
  );
  return result.rows[0] ?? null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  return user;
}

export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await database().query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
  jar.delete(cookieName);
}
