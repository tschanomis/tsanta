"use client";

import { useActionState, useState } from "react";
import { deleteSuggestion, saveSuggestion } from "@/app/actions/suggestions";
import type { Theme } from "./themes";

export function MessageForm({ theme, id = null, initialBody = "" }: {
  theme: Theme;
  id?: string | null;
  initialBody?: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [error, action, pending] = useActionState(async (_: string, form: FormData) => {
    const result = await saveSuggestion(theme, id, form);
    if (!result && id === null) setBody("");
    return result;
  }, "");

  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-2 text-sm font-medium">
        {id ? "Modifier le message" : "Nouveau message"}
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          readOnly={pending}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 focus-visible:outline-2 focus-visible:outline-emerald-400"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button disabled={pending} className="w-fit rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
        {pending ? "Enregistrement…" : id ? "Enregistrer" : "Publier"}
      </button>
    </form>
  );
}

export function DeleteMessage({ id }: { id: string }) {
  const [error, action, pending] = useActionState(async (previousError: string) => {
    if (!window.confirm("Supprimer ce message ?")) return previousError;
    return deleteSuggestion(id);
  }, "");

  return (
    <form action={action} className="mt-3">
      <button disabled={pending} className="text-sm font-medium text-red-400 hover:underline disabled:opacity-60">
        {pending ? "Suppression…" : "Supprimer"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
