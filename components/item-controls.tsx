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
      <p className="mt-4 wrap-break-word text-zinc-400">« {item.title} » sera supprimé de ta liste. Cette action est définitive.</p>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={item.id} />
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={pending} onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 font-medium hover:bg-zinc-800 disabled:opacity-60">Annuler</button>
          <button disabled={pending} className="rounded-xl bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-60">{pending ? "Suppression…" : "Supprimer"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ItemControls({ item }: { item: ListItem }) {
  const [popup, setPopup] = useState<"edit" | "delete" | null>(null);
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => setPopup("edit")} aria-label={`Modifier ${item.title}`} title="Modifier" className="inline-flex size-11 items-center justify-center rounded-lg text-emerald-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16 3 5 5M4 15 16 3a2.12 2.12 0 0 1 5 5L9 20l-6 1 1-6Z" />
        </svg>
      </button>
      <button type="button" onClick={() => setPopup("delete")} aria-label={`Supprimer ${item.title}`} title="Supprimer" className="inline-flex size-11 items-center justify-center rounded-lg text-red-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
        </svg>
      </button>
      {popup === "edit" && <ItemDialog item={item} onClose={() => setPopup(null)} />}
      {popup === "delete" && <DeleteItemDialog item={item} onClose={() => setPopup(null)} />}
    </div>
  );
}
