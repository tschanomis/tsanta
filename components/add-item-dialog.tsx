"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Modal } from "@/components/modal";
import type { ListItem } from "@/lib/data/items";
import { addItem, editItem } from "@/app/actions/items";

export function ItemDialog({
  onClose,
  item,
  titleOnly = false,
}: {
  onClose: () => void;
  item?: ListItem;
  titleOnly?: boolean;
}) {
  const [state, action, pending] = useActionState(item ? editItem : addItem, {
    error: "",
    success: false,
  });

  const [urls, setUrls] = useState<string[]>(item?.url.length ? item.url : [""]);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  const inputClass =
    "mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 focus:outline-2 focus:outline-emerald-700";
  return (
    <Modal
      title={
        titleOnly
          ? item
            ? "Modifier la section"
            : "Ajouter une section"
          : item
            ? "Modifier des cadeaux"
            : "Ajouter un cadeau"
      }
      pending={pending}
      onClose={onClose}
    >
      <form action={action} aria-busy={pending} className="mt-6 space-y-5">
        {item && <input type="hidden" name="id" value={item.id} />}
        {(!item || titleOnly) && (
          <label className="block text-sm font-medium">
            Titre <strong className="text-emerald-400">*</strong>
            <input
              name="title"
              defaultValue={item?.title}
              autoFocus
              required
              maxLength={100}
              className={inputClass}
            />
          </label>
        )}
        {!titleOnly && (
          <>
            <label className="block text-sm font-medium">
              Description
              <textarea
                name="description"
                defaultValue={item?.description ?? ""}
                autoFocus={!!item}
                maxLength={2000}
                rows={5}
                className={inputClass}
              />
            </label>
            <fieldset className="space-y-3" disabled={pending}>
              <legend className="text-sm font-medium">Liens</legend>
              {urls.map((url, index) => (
                <div key={index} className="flex items-end gap-2">
                  <label className="min-w-0 flex-1 text-sm font-medium">
                    Lien {index + 1}
                    <input
                      name="url"
                      value={url}
                      onChange={(event) =>
                        setUrls(
                          urls.map((value, position) =>
                            position === index ? event.target.value : value,
                          ),
                        )
                      }
                      type="url"
                      maxLength={2048}
                      placeholder="https://…"
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    aria-label={`Supprimer le lien ${index + 1}`}
                    onClick={() =>
                      setUrls(
                        urls.length === 1 ? [""] : urls.filter((_, position) => position !== index),
                      )
                    }
                    title="Supprimer le lien"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"
                      />
                    </svg>
                  </button>
                  {index === urls.length - 1 ? (
                    <button
                      type="button"
                      aria-label="Ajouter un lien"
                      title="Ajouter un lien"
                      onClick={() => setUrls([...urls, ""])}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-emerald-400 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-5"
                      >
                        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  ) : (
                    <span aria-hidden="true" className="size-11 shrink-0" />
                  )}
                </div>
              ))}
            </fieldset>
          </>
        )}
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md border border-zinc-700 px-5 py-3 font-medium hover:bg-zinc-800 disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            disabled={pending}
            className={clsx(
              "rounded-md bg-emerald-800 shadow-[0_0_20px_#00ffc318] px-5 py-3 font-medium text-white hover:bg-emerald-900",
              pending && "cursor-wait opacity-60",
            )}
          >
            {pending ? "Enregistrement…" : item ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddItemDialog() {
  const [open, setOpen] = useState<"gift" | "title" | null>(null);
  const menuId = useId();
  const menu = useRef<HTMLDivElement>(null);

  function selectItem(kind: "gift" | "title") {
    menu.current?.hidePopover();
    setOpen(kind);
  }

  const optionClass =
    "block w-full cursor-pointer rounded-md px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-emerald-950 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400";

  return (
    <div className="relative">
      <button
        type="button"
        popoverTarget={menuId}
        aria-label="Ajouter"
        title="Ajouter"
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md bg-emerald-800 text-white shadow-[0_0_20px_#00ffc318] transition-[background-color,box-shadow] duration-200 hover:bg-emerald-700 hover:shadow-[0_0_24px_#00ffc330] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-5"
        >
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div
        ref={menu}
        id={menuId}
        popover="auto"
        className="fixed inset-auto z-10 m-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-zinc-100 shadow-xl [position-area:bottom_span-left] [position-try-fallbacks:flip-inline]"
      >
        <button type="button" onClick={() => selectItem("gift")} className={optionClass}>
          Cadeau
        </button>
        <button type="button" onClick={() => selectItem("title")} className={optionClass}>
          Section
        </button>
      </div>
      {open && <ItemDialog titleOnly={open === "title"} onClose={() => setOpen(null)} />}
    </div>
  );
}
