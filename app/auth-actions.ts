"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { database } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = { error: string };
const unavailable = { error: "Le service est momentanément indisponible. Réessayez plus tard." };

function credentials(form: FormData) {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
      || password.length < 12 || password.length > 128) return null;
  return { email: normalized, password };
}

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const input = credentials(form);
  if (!input) return { error: "Saisissez un email valide et un mot de passe de 12 à 128 caractères." };
  if (form.get("confirmation") !== input.password) return { error: "Les mots de passe ne correspondent pas." };
  try {
    const hash = await hashPassword(input.password);
    const result = await database().query<{ id: string }>(
      `INSERT INTO users (id, email, password_hash)
       SELECT $1, email, $3 FROM allowed_emails WHERE email = $2
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [randomUUID(), input.email, hash],
    );
    if (!result.rows[0]) return { error: "Inscription impossible pour cette adresse. Vérifiez votre invitation ou connectez-vous si vous avez déjà un compte." };
    await createSession(result.rows[0].id);
  } catch {
    return unavailable;
  }
  redirect("/");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const input = credentials(form);
  const invalid = { error: "Identifiants incorrects ou connexion temporairement bloquée." };
  if (!input) return invalid;
  try {
    const result = await database().query<{ id: string; password_hash: string; locked: boolean }>(
      "SELECT id, password_hash, (locked_until > now()) AS locked FROM users WHERE email = $1", [input.email],
    );
    const user = result.rows[0];
    // Même calcul coûteux pour une adresse inconnue afin de limiter l'énumération.
    const valid = await verifyPassword(input.password, user?.password_hash ?? `${"0".repeat(32)}:${"0".repeat(128)}`);
    if (!user || user.locked) return invalid;
    if (!valid) {
      await database().query(
        `UPDATE users SET failed_attempts = CASE WHEN locked_until <= now() THEN 1 ELSE failed_attempts + 1 END,
         locked_until = CASE WHEN (CASE WHEN locked_until <= now() THEN 1 ELSE failed_attempts + 1 END) >= 5
         THEN now() + interval '15 minutes' ELSE NULL END WHERE id = $1`, [user.id],
      );
      return invalid;
    }
    await database().query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1", [user.id]);
    await createSession(user.id);
  } catch {
    return unavailable;
  }
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/connexion");
}
