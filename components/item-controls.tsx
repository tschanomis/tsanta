"use client";

import { useActionState, useEffect, useState } from "react";
import { removeItem } from "@/app/actions/items";
import { ItemDialog } from "@/components/add-item-dialog";
import { Modal } from "@/components/modal";
import type { ListItem } from "@/lib/data/items";

function DeleteItemDialog({ item, onClose }: { item: ListItem; onClose: () => void }) {
  const [state, action, pending] = useActionState(removeItem, { error: "", success: false });

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <Modal title="Supprimer cet item ?" pending={pending} onClose={onClose}>
      <p className="mt-4 wrap-break-word text-zinc-600">« {item.title} » sera supprimé de ta liste. Cette action est définitive.</p>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={item.id} />
        <p role="alert" className="text-sm text-red-700">{state.error}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={pending} onClick={onClose} className="rounded-xl border border-zinc-300 px-5 py-3 font-medium hover:bg-zinc-50 disabled:opacity-60">Annuler</button>
          <button disabled={pending} className="rounded-xl bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-60">{pending ? "Suppression…" : "Supprimer"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ItemControls({ item }: { item: ListItem }) {
  const [popup, setPopup] = useState<"edit" | "delete" | null>(null);
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setPopup("edit")} className="rounded font-medium text-emerald-800 underline underline-offset-4">Modifier<span className="sr-only"> {item.title}</span></button>
        <button onClick={() => setPopup("delete")} className="rounded font-medium text-red-700 underline underline-offset-4">Supprimer<span className="sr-only"> {item.title}</span></button>
      </div>
      {popup === "edit" && <ItemDialog item={item} onClose={() => setPopup(null)} />}
      {popup === "delete" && <DeleteItemDialog item={item} onClose={() => setPopup(null)} />}
    </div>
  );
}
