"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createOwnItem, updateOwnItem, deleteOwnItem, setItemReservation, moveOwnItem } from "@/lib/data/items";

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
    return { error: "Impossible d’ajouter ce cadeau. Réessaie plus tard.", success: false };
  }
  revalidatePath(`/utilisateurs/${userId}`);
  return { error: "", success: true };
}

function optionalFields(form: FormData): ItemState | { description: string | null; url: string[] } {
  const description = form.get("description");
  const urls = form.getAll("url");
  if (description !== null && (typeof description !== "string" || description.trim().length > 2000)) {
    return { error: "La description doit contenir au maximum 2 000 caractères.", success: false };
  }
  const itemUrls: string[] = [];
  for (const url of urls) {
    if (typeof url !== "string" || url.trim().length > 2048) {
      return { error: "Chaque lien doit contenir au maximum 2 048 caractères.", success: false };
    }
    if (!url.trim()) continue;
    try {
      const parsed = new URL(url.trim());
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.href.length > 2048) {
        throw new Error("Invalid URL");
      }
      if (!itemUrls.includes(parsed.href)) itemUrls.push(parsed.href);
    } catch {
      return { error: "Saisis des liens valides commençant par http:// ou https://.", success: false };
    }
  }
  // Section forms omit the field. A gift can submit an empty description.
  return { description: description?.trim() ?? null, url: itemUrls };
}

function isItemId(id: unknown): id is string {
  return typeof id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
}

function itemId(form: FormData) {
  const id = form.get("id");
  return isItemId(id) ? id : null;
}

export async function reorderItems(sourceId: string, targetId: string): Promise<ItemState> {
  if (!isItemId(sourceId) || !isItemId(targetId) || sourceId === targetId) {
    return { error: "Déplacement invalide.", success: false };
  }
  try {
    const userId = await moveOwnItem(sourceId, targetId);
    if (!userId) return { error: "La liste a changé. Réessaie avec les éléments actuels.", success: false };
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible d’enregistrer le déplacement. Réessaie plus tard.", success: false };
  }
}

export async function editItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const id = itemId(form);
  if (!id) return { error: "Cadeaux invalides.", success: false };
  const title = form.get("title");
  if (title !== null && (typeof title !== "string" || !title.trim() || title.trim().length > 100)) {
    return { error: "Saisis un titre de 1 à 100 caractères.", success: false };
  }
  const fields = optionalFields(form);
  if ("error" in fields) return fields;
  try {
    const userId = await updateOwnItem(id, fields.description, fields.url, typeof title === "string" ? title.trim() : null);
    if (!userId) return { error: "Cadeaux introuvables ou non autorisés.", success: false };
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible de modifier ces cadeaux. Réessaie plus tard.", success: false };
  }
}

export async function removeItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const id = itemId(form);
  if (!id) return { error: "Cadeaux invalides.", success: false };
  try {
    const userId = await deleteOwnItem(id);
    if (!userId) return { error: "Cadeaux introuvables ou non autorisés.", success: false };
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible de supprimer ces cadeaux. Réessaie plus tard.", success: false };
  }
}

export async function reserveItem(_: ItemState, form: FormData): Promise<ItemState> {
  await requireUser();
  const id = itemId(form);
  const checked = form.get("checked");
  if (!id || (checked !== "true" && checked !== "false")) {
    return { error: "Réservation invalide.", success: false };
  }
  try {
    const userId = await setItemReservation(id, checked === "true");
    if (!userId) {
      revalidatePath("/utilisateurs/[id]", "page");
      return { error: "Ce cadeau est déjà réservé ou n’est plus disponible.", success: false };
    }
    revalidatePath(`/utilisateurs/${userId}`);
    return { error: "", success: true };
  } catch {
    return { error: "Impossible de modifier la réservation. Réessaie plus tard.", success: false };
  }
}
