"use client";

import { useActionState, useState } from "react";
import { removeItem } from "@/app/actions/items";
import { ItemDialog } from "@/components/add-item-dialog";
import type { ListItem } from "@/lib/data/items";

export function ItemControls({ item }: { item: ListItem }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(removeItem, { error: "", success: false });
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-4">
        <button disabled={pending} onClick={() => setEditing(true)} className="rounded font-medium text-emerald-800 underline underline-offset-4 disabled:opacity-60">Modifier<span className="sr-only"> {item.title}</span></button>
        <form action={action} onSubmit={(event) => { if (!window.confirm(`Supprimer « ${item.title} » ?`)) event.preventDefault(); }}>
          <input type="hidden" name="id" value={item.id} />
          <button disabled={pending} className="rounded font-medium text-red-700 underline underline-offset-4 disabled:opacity-60">{pending ? "Suppression…" : "Supprimer"}<span className="sr-only"> {item.title}</span></button>
        </form>
      </div>
      <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>
      {editing && <ItemDialog item={item} onClose={() => setEditing(false)} />}
    </div>
  );
}
