import "server-only";

import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";

export type ListItem = { id: string; title: string; description: string | null; url: string[] };

export async function getUserItems(userId: string): Promise<ListItem[]> {
  await requireUser();
  const result = await database().query<ListItem>(
    "SELECT id, title, description, url FROM items WHERE user_id = $1 ORDER BY created_at DESC, id",
    [userId],
  );
  return result.rows;
}

export async function createOwnItem(title: string, description: string | null, url: string[]) {
  const user = await requireUser();
  await database().query(
    "INSERT INTO items (id, user_id, title, description, url) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), user.id, title, description, url],
  );
  return user.id;
}

export async function updateOwnItem(id: string, description: string | null, url: string[]) {
  const user = await requireUser();
  const result = await database().query(
    "UPDATE items SET description = $1, url = $2 WHERE id = $3 AND user_id = $4 RETURNING id",
    [description, url, id, user.id],
  );
  return result.rows.length ? user.id : null;
}

export async function deleteOwnItem(id: string) {
  const user = await requireUser();
  const result = await database().query(
    "DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, user.id],
  );
  return result.rows.length ? user.id : null;
}
