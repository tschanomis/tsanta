import "server-only";

import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";

export type ListItem = { id: string; title: string; description: string | null; url: string | null };

export async function getUserItems(userId: string): Promise<ListItem[]> {
  await requireUser();
  const result = await database().query<ListItem>(
    "SELECT id, title, description, url FROM items WHERE user_id = $1 ORDER BY created_at DESC, id",
    [userId],
  );
  return result.rows;
}

export async function createOwnItem(title: string, description: string | null, url: string | null) {
  const user = await requireUser();
  await database().query(
    "INSERT INTO items (id, user_id, title, description, url) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), user.id, title, description, url],
  );
  return user.id;
}
