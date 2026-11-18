"use client";

import { useCallback, useRef, useState, useTransition, type ReactNode } from "react";
import clsx from "clsx";
import { reorderItems } from "@/app/actions/items";
import { Toast, type ToastMessage } from "@/components/toast";

type SortableItem = { id: string; title: string; content: ReactNode };

export function SortableItemList({ items }: { items: SortableItem[] }) {
  const draggedId = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pending, startTransition] = useTransition();
  const dismissToast = useCallback(() => setToast(null), []);

  function move(sourceId: string, destinationId: string) {
    if (pending || sourceId === destinationId) return;
    setSelectedId(null);
    setTargetId(null);
    dismissToast();
    startTransition(async () => {
      try {
        const result = await reorderItems(sourceId, destinationId);
        setToast(result.success
          ? { type: "success", message: "Ordre enregistré." }
          : { type: "error", message: result.error });
      } catch {
        setToast({ type: "error", message: "Impossible d’enregistrer le déplacement. Réessaie plus tard." });
      }
    });
  }

  function endDrag() {
    draggedId.current = null;
    setTargetId(null);
  }

  return (
    <>
      <p role="status" className="sr-only">
        {pending && "Enregistrement de l’ordre…"}
      </p>
      <Toast notification={toast} onDismiss={dismissToast} />
      <ul className="mt-4 space-y-2" aria-busy={pending}>
        {items.map((item, index) => (
          <li
            key={item.id}
            tabIndex={items.length > 1 ? 0 : undefined}
            draggable={items.length > 1 && !pending}
            className={clsx(
              "rounded-md py-2 focus-visible:outline-1 focus-visible:outline-emerald-400",
              items.length > 1 && !pending && "cursor-grab active:cursor-grabbing",
              (targetId === item.id || selectedId === item.id) && "bg-emerald-950/50 ring-[0.25px] ring-emerald-500",
            )}
            onDragStart={(event) => {
              if (event.target !== event.currentTarget) return;
              draggedId.current = item.id;
              setSelectedId(null);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", item.id);
            }}
            onDragEnd={endDrag}
            onDragOver={(event) => {
              if (!draggedId.current || draggedId.current === item.id || pending) {
                setTargetId(null);
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setTargetId(item.id);
            }}
            onDrop={(event) => {
              const sourceId = draggedId.current;
              if (!sourceId) return;
              event.preventDefault();
              endDrag();
              move(sourceId, item.id);
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "touch" || items.length < 2 || pending) return;
              if (event.target instanceof Element && event.target.closest("a, button, input, label, dialog")) return;
              if (selectedId && selectedId !== item.id) move(selectedId, item.id);
              else setSelectedId(selectedId ? null : item.id);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Escape") setSelectedId(null);
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
              const destination = items[index + (event.key === "ArrowUp" ? -1 : 1)];
              if (!destination || pending) return;
              event.preventDefault();
              move(item.id, destination.id);
            }}
          >
            {item.content}
          </li>
        ))}
      </ul>
    </>
  );
}
