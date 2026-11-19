import "server-only";

import { randomUUID } from "node:crypto";
import type { Theme } from "@/app/suggestions/themes";
import { database } from "@/lib/db";

type Suggestion = {
  id: string;
  user_id: string;
  author: string;
  body: string;
  created_at: Date;
  updated_at: Date | null;
};

export async function getSuggestions(theme: Theme, limit: number) {
  const { rows } = await database().query<Suggestion>(
    `SELECT suggestions.id, suggestions.user_id, suggestions.body, suggestions.created_at,
       suggestions.updated_at, COALESCE(NULLIF(trim(users.name), ''), 'Nom non renseigné') AS author
     FROM suggestions JOIN users ON users.id = suggestions.user_id
     WHERE suggestions.theme = $1
     ORDER BY suggestions.created_at DESC, suggestions.id
     LIMIT $2`,
    [theme, limit + 1],
  );
  return { messages: rows.slice(0, limit), hasMore: rows.length > limit };
}

export async function createSuggestion(userId: string, theme: Theme, body: string) {
  await database().query(
    "INSERT INTO suggestions (id, user_id, theme, body) VALUES ($1, $2, $3, $4)",
    [randomUUID(), userId, theme, body],
  );
}

export async function updateOwnSuggestion(userId: string, id: string, theme: Theme, body: string) {
  const result = await database().query(
    `UPDATE suggestions SET body = $1,
     updated_at = CASE WHEN body <> $1 THEN now() ELSE updated_at END
     WHERE id = $2 AND user_id = $3 AND theme = $4`,
    [body, id, userId, theme],
  );
  return Boolean(result.rowCount);
}

export async function deleteOwnSuggestion(userId: string, id: string) {
  const result = await database().query(
    "DELETE FROM suggestions WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return Boolean(result.rowCount);
}
