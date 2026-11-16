import "server-only";

import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";

export type ListItem = { id: string; title: string; description: string | null; url: string[]; reserved_by: string | null; reserved_name: string | null };

export async function getUserItems(userId: string): Promise<ListItem[]> {
  await requireUser();
  const result = await database().query<ListItem>(
    `SELECT items.id, items.title, items.description, items.url, items.reserved_by,
     CASE WHEN users.id IS NOT NULL THEN COALESCE(NULLIF(trim(users.name), ''), 'Nom non renseigné') END AS reserved_name
     FROM items LEFT JOIN users ON users.id = items.reserved_by
     WHERE items.user_id = $1 ORDER BY items.created_at DESC, items.id`,
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

export async function updateOwnItem(id: string, description: string | null, url: string[], title: string | null) {
  const user = await requireUser();
  const result = await database().query(
    "UPDATE items SET description = $1, url = $2, title = COALESCE($5, title) WHERE id = $3 AND user_id = $4 RETURNING id",
    [description, url, id, user.id, title],
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

export async function setItemReservation(id: string, checked: boolean) {
  const user = await requireUser();
  const result = await database().query<{ user_id: string }>(
    `UPDATE items SET reserved_by = CASE WHEN $3::boolean THEN $2::uuid ELSE NULL END
     WHERE id = $1 AND user_id <> $2
       AND (description IS NOT NULL OR cardinality(url) > 0)
       AND (reserved_by = $2 OR ($3::boolean AND reserved_by IS NULL))
     RETURNING user_id`,
    [id, user.id, checked],
  );
  return result.rows[0]?.user_id ?? null;
}
