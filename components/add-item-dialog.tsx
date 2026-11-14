"use client";

import { useActionState, useEffect, useState } from "react";
import clsx from "clsx";
import { Modal } from "@/components/modal";
import type { ListItem } from "@/lib/data/items";
import { addItem, editItem } from "@/app/actions/items";

export function ItemDialog({ onClose, item }: { onClose: () => void; item?: ListItem }) {
  const [state, action, pending] = useActionState(item ? editItem : addItem, { error: "", success: false });

  const [urls, setUrls] = useState<string[]>(item?.url.length ? item.url : [""]);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  const inputClass = "mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 focus:outline-2 focus:outline-emerald-700";
  return (
    <Modal title={item ? "Modifier un item" : "Ajouter un item"} pending={pending} onClose={onClose}>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        {item && <input type="hidden" name="id" value={item.id} />}
        {!item && (
          <label className="block text-sm font-medium">Titre <strong className="text-emerald-400">*</strong>
            <input name="title" autoFocus required maxLength={100} className={inputClass} />
          </label>
        )}
        <label className="block text-sm font-medium">Description
          <textarea name="description" defaultValue={item?.description ?? ""} autoFocus={!!item} maxLength={2000} rows={5} className={inputClass} />
        </label>
        <fieldset className="space-y-3" disabled={pending}>
          <legend className="text-sm font-medium">Liens</legend>
          {urls.map((url, index) => (
            <div key={index} className="flex items-end gap-2">
              <label className="min-w-0 flex-1 text-sm font-medium">
                Lien {index + 1}
                <input name="url" value={url} onChange={(event) => setUrls(urls.map((value, position) => position === index ? event.target.value : value))} type="url" maxLength={2048} placeholder="https://…" className={inputClass} />
              </label>
              <button type="button" aria-label={`Supprimer le lien ${index + 1}`} onClick={() => setUrls(urls.filter((_, position) => position !== index))} title="Supprimer le lien" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" aria-label="Ajouter un lien" title="Ajouter un lien" onClick={() => setUrls([...urls, ""])} className="inline-flex size-11 items-center justify-center rounded-lg text-emerald-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </fieldset>
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
