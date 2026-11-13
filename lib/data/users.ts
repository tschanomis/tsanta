import "server-only";

import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";

export type UserProfile = { id: string; name: string };

export async function getRegisteredUsers(): Promise<UserProfile[]> {
  await requireUser();
  const result = await database().query<UserProfile>(
    `SELECT id, COALESCE(NULLIF(trim(name), ''), 'Nom non renseigné') AS name
     FROM users ORDER BY lower(name), id`,
  );
  return result.rows;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  await requireUser();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) {
    return null;
  }
  const result = await database().query<UserProfile>(
    `SELECT id, COALESCE(NULLIF(trim(name), ''), 'Nom non renseigné') AS name
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}
