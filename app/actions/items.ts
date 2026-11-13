"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createOwnItem } from "@/lib/data/items";

export type ItemState = { error: string; success: boolean };

export async function addItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const title = form.get("title");
  const description = form.get("description");
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    return { error: "Saisis un titre de 1 à 100 caractères.", success: false };
  }
  if (typeof description !== "string" || !description.trim() || description.trim().length > 2000) {
    return { error: "Saisis une description de 1 à 2 000 caractères.", success: false };
  }
  let userId: string;
  try {
    userId = await createOwnItem(title.trim(), description.trim());
  } catch {
    return { error: "Impossible d’ajouter cet item. Réessaie plus tard.", success: false };
  }
  revalidatePath(`/utilisateurs/${userId}`);
  return { error: "", success: true };
}
