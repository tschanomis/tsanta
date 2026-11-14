"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function Modal({ title, children, pending = false, onClose }: {
  title: string;
  children: ReactNode;
  pending?: boolean;
  onClose: () => void;
}) {
  const headingId = useId();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby={headingId} onClose={onClose} onCancel={(event) => { if (pending) event.preventDefault(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg bg-zinc-900 p-6 text-zinc-100 shadow-[0_0_70px_#00ffc31a] backdrop:bg-zinc-950/85 backdrop:backdrop-blur-sm sm:p-8">
      <h2 id={headingId} className="text-2xl font-semibold">{title}</h2>
      {children}
    </dialog>
  );
}
