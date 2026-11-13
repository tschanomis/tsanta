"use client";

import { useActionState, useEffect, useState } from "react";
import clsx from "clsx";
import { Modal } from "@/components/modal";
import { addItem, editItem } from "@/app/actions/items";

export function ItemDialog({ onClose, item }: { onClose: () => void; item?: { id: string; title: string; description: string | null; url: string | null } }) {
  const [state, action, pending] = useActionState(item ? editItem : addItem, { error: "", success: false });

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  const inputClass = "mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 focus:outline-2 focus:outline-emerald-700";
  return (
    <Modal title={item ? "Modifier un item" : "Ajouter un item"} pending={pending} onClose={onClose}>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        {item && <input type="hidden" name="id" value={item.id} />}
        {!item && (
          <label className="block text-sm font-medium">Titre (obligatoire)
            <input name="title" autoFocus required maxLength={100} className={inputClass} />
          </label>
        )}
        <label className="block text-sm font-medium">Description (facultatif)
          <textarea name="description" defaultValue={item?.description ?? ""} autoFocus={!!item} maxLength={2000} rows={5} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">URL (facultatif)
          <input name="url" defaultValue={item?.url ?? ""} type="url" maxLength={2048} placeholder="https://…" className={inputClass} />
        </label>
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" disabled={pending} onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 font-medium hover:bg-zinc-800 disabled:opacity-60">Annuler</button>
          <button disabled={pending} className={clsx("rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900", pending && "cursor-wait opacity-60")}>
            {pending ? "Enregistrement…" : item ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900">Ajouter un item</button>
      {open && <ItemDialog onClose={() => setOpen(false)} />}
    </>
  );
}
