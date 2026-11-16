"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { reserveItem } from "@/app/actions/items";
import type { ListItem } from "@/lib/data/items";

function ReservationDialog({ item, checked, onClose }: { item: ListItem; checked: boolean; onClose: () => void }) {
  const [state, action, pending] = useActionState(reserveItem, { error: "", success: false });

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <Modal title={checked ? "Réserver ce cadeau ?" : "Annuler ta réservation ?"} pending={pending} onClose={onClose}>
      <p className="mt-4 wrap-break-word text-zinc-400">
        {checked ? <>Tu souhaites réserver « {item.title} » ?</> : <>« {item.title} » sera à nouveau disponible pour les autres utilisateurs.</>}
      </p>
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="checked" value={String(checked)} />
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={pending} onClick={onClose} className="cursor-pointer rounded-md border border-zinc-700 px-5 py-3 font-medium transition-colors hover:bg-zinc-800 disabled:opacity-60">Retour</button>
          <button disabled={pending} className="cursor-pointer rounded-md bg-emerald-800 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
            {pending ? "Enregistrement…" : checked ? "Réserver" : "Annuler la réservation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ItemReservation({ item, viewerId }: { item: ListItem; viewerId: string }) {
  const [confirmation, setConfirmation] = useState<boolean | null>(null);
  const reserved = item.reserved_by !== null;
  const ownReservation = item.reserved_by === viewerId;
  const name = item.reserved_name ?? "Nom non renseigné";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("fr");

  return (
    <div className="shrink-0">
      <div className="flex min-h-11 min-w-11 items-center justify-center gap-2">
        {reserved && !ownReservation && (
          <span className="inline-flex size-11 items-center justify-center">
            <input type="checkbox" checked disabled aria-label={`Réservé par ${name}`} className="size-5 accent-emerald-500" />
          </span>
        )}
        {reserved ? (
          <span tabIndex={ownReservation ? undefined : 0} title={name} aria-label={ownReservation ? undefined : `Réservé par ${name}`} className="group relative inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
            <button type="button" onClick={() => setConfirmation(false)} disabled={!ownReservation} aria-label={ownReservation ? `Annuler ma réservation de ${item.title}` : `Réservé par ${name}`} className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-950 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-700 transition-colors enabled:hover:bg-emerald-900 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
              {initials}
            </button>
            <span aria-hidden="true" className="pointer-events-none absolute top-full right-0 z-10 mt-2 hidden w-max max-w-60 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-normal wrap-break-word text-zinc-100 shadow-lg group-hover:block group-focus-within:block">{name}</span>
          </span>
        ) : (
          <label className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-zinc-800 has-disabled:cursor-default">
            <input type="checkbox" checked={false} onChange={() => setConfirmation(true)} aria-label={`Réserver ${item.title}`} className="size-5 cursor-pointer accent-emerald-500 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400" />
          </label>
        )}
      </div>
      {confirmation !== null && <ReservationDialog item={item} checked={confirmation} onClose={() => setConfirmation(null)} />}
    </div>
  );
}
