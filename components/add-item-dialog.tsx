"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { addItem } from "@/app/actions/items";

function ItemDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(addItem, { error: "", success: false });

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  const inputClass = "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 focus:outline-2 focus:outline-emerald-700";
  return (
    <dialog ref={dialog} aria-labelledby="add-item-title" onClose={onClose} onCancel={(event) => { if (pending) event.preventDefault(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/40 sm:p-8">
      <h2 id="add-item-title" className="text-2xl font-semibold">Ajouter un item</h2>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">Titre
          <input name="title" autoFocus required maxLength={100} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">Description
          <textarea name="description" required maxLength={2000} rows={5} className={inputClass} />
        </label>
        <p role="alert" className="text-sm text-red-700">{state.error}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" disabled={pending} onClick={onClose} className="rounded-xl border border-zinc-300 px-5 py-3 font-medium hover:bg-zinc-50 disabled:opacity-60">Annuler</button>
          <button disabled={pending} className={clsx("rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900", pending && "cursor-wait opacity-60")}>
            {pending ? "Ajout en cours…" : "Ajouter"}
          </button>
        </div>
      </form>
    </dialog>
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
