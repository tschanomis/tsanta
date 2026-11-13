"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { database } from "@/lib/db";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { credentials } from "@/lib/credentials";
import { hashPassword } from "@/lib/password";

export type AuthState = { error: string };
const unavailable = { error: "Le service est momentanément indisponible. Réessayez plus tard." };

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const name = form.get("name");
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return { error: "Saisissez un nom de 1 à 100 caractères." };
  }
  const input = credentials({ email: form.get("email"), password: form.get("password") });
  if (!input) return { error: "Saisissez un email valide et un mot de passe de 12 à 128 caractères." };
  if (form.get("confirmation") !== input.password) return { error: "Les mots de passe ne correspondent pas." };
  try {
    const hash = await hashPassword(input.password);
    const result = await database().query<{ id: string }>(
      `INSERT INTO users (id, email, password_hash, name)
       SELECT $1, email, $3, $4 FROM allowed_emails WHERE email = $2
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [randomUUID(), input.email, hash, name.trim()],
    );
    if (!result.rows[0]) return { error: "Inscription impossible pour cette adresse. Vérifiez votre invitation ou connectez-vous si vous avez déjà un compte." };
  } catch {
    return unavailable;
  }
  return login(_, form);
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const input = credentials({ email: form.get("email"), password: form.get("password") });
  const invalid = { error: "Identifiants incorrects ou connexion temporairement bloquée." };
  if (!input) return invalid;
  try {
    await signIn("credentials", { ...input, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin" ? invalid : unavailable;
    }
    throw error;
  }
  redirect("/");
}

export async function logout() {
  await signOut({ redirectTo: "/connexion" });
}
