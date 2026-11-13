"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createOwnItem } from "@/lib/data/items";

export type ItemState = { error: string; success: boolean };

export async function addItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const title = form.get("title");
  const description = form.get("description") ?? "";
  const url = form.get("url") ?? "";
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    return { error: "Saisis un titre de 1 à 100 caractères.", success: false };
  }
  if (typeof description !== "string" || description.trim().length > 2000) {
    return { error: "La description doit contenir au maximum 2 000 caractères.", success: false };
  }
  if (typeof url !== "string" || url.trim().length > 2048) {
    return { error: "L’URL doit contenir au maximum 2 048 caractères.", success: false };
  }
  let itemUrl = url.trim();
  if (itemUrl) {
    try {
      const parsed = new URL(itemUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
      itemUrl = parsed.href;
      if (itemUrl.length > 2048) throw new Error("URL too long");
    } catch {
      return { error: "Saisis une URL valide commençant par http:// ou https://.", success: false };
    }
  }
  let userId: string;
  try {
    userId = await createOwnItem(title.trim(), description.trim() || null, itemUrl || null);
  } catch {
    return { error: "Impossible d’ajouter cet item. Réessaie plus tard.", success: false };
  }
  revalidatePath(`/utilisateurs/${userId}`);
  return { error: "", success: true };
}
