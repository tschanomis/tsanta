"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createOwnItem, updateOwnItem, deleteOwnItem } from "@/lib/data/items";

export type ItemState = { error: string; success: boolean };

export async function addItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const title = form.get("title");
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    return { error: "Saisis un titre de 1 à 100 caractères.", success: false };
  }
  const fields = optionalFields(form);
  if ("error" in fields) return fields;
  let userId: string;
  try {
    userId = await createOwnItem(title.trim(), fields.description, fields.url);
  } catch {
    return { error: "Impossible d’ajouter cet item. Réessaie plus tard.", success: false };
  }
  revalidatePath(`/utilisateurs/${userId}`);
  return { error: "", success: true };
}

function optionalFields(form: FormData): ItemState | { description: string | null; url: string | null } {
  const description = form.get("description") ?? "";
  const url = form.get("url") ?? "";
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
  return { description: description.trim() || null, url: itemUrl || null };
}

function itemId(form: FormData) {
  const id = form.get("id");
  return typeof id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id) ? id : null;
}

export async function editItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const id = itemId(form);
  if (!id) return { error: "Item invalide.", success: false };
  const fields = optionalFields(form);
  if ("error" in fields) return fields;
  try {
    const userId = await updateOwnItem(id, fields.description, fields.url);
    if (!userId) return { error: "Item introuvable ou non autorisé.", success: false };
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible de modifier cet item. Réessaie plus tard.", success: false };
  }
}

export async function removeItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const id = itemId(form);
  if (!id) return { error: "Item invalide.", success: false };
  try {
    const userId = await deleteOwnItem(id);
    if (!userId) return { error: "Item introuvable ou non autorisé.", success: false };
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible de supprimer cet item. Réessaie plus tard.", success: false };
  }
}
