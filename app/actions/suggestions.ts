"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isTheme, type Theme } from "@/app/suggestions/themes";
import { createSuggestion, updateOwnSuggestion, deleteOwnSuggestion } from "@/lib/data/suggestions";

export async function saveSuggestion(theme: Theme, id: string | null, form: FormData) {
  const user = await requireUser();
  if (!isTheme(theme)) return "Thème invalide.";

  const value = form.get("body");
  const body = typeof value === "string" ? value.trim() : "";
  if (!body || body.length > 2000) return "Saisis un message de 1 à 2 000 caractères.";

  try {
    if (id === null) {
      await createSuggestion(user.id, theme, body);
    } else {
      const updated = await updateOwnSuggestion(user.id, id, theme, body);
      if (!updated) return "Message introuvable ou non autorisé.";
    }
  } catch {
    return "Impossible d’enregistrer le message. Réessaie plus tard.";
  }
  revalidatePath("/suggestions");
  return "";
}

export async function deleteSuggestion(id: string) {
  const user = await requireUser();

  try {
    const deleted = await deleteOwnSuggestion(user.id, id);
    if (!deleted) return "Message introuvable ou non autorisé.";
  } catch {
    return "Impossible de supprimer le message. Réessaie plus tard.";
  }
  revalidatePath("/suggestions");
  return "";
}
