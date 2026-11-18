"use client";

import { useEffect } from "react";
import clsx from "clsx";

export type ToastMessage = { type: "success" | "error"; message: string };

export function Toast({ notification, onDismiss }: {
  notification: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (notification?.type !== "success") return;
    const timeout = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timeout);
  }, [notification, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:justify-end">
      <div
        className={clsx(notification && [
          "pointer-events-auto flex w-fit max-w-sm items-start gap-3 rounded-lg border bg-zinc-900 py-2 pr-2 pl-4 text-sm shadow-xl",
          notification.type === "error" ? "border-red-500/50 text-red-200" : "border-emerald-500/50 text-emerald-200",
        ])}
      >
        <p role="status" className={notification?.type === "success" ? "py-2" : "sr-only"}>
          {notification?.type === "success" && notification.message}
        </p>
        <p role="alert" className={notification?.type === "error" ? "py-2" : "sr-only"}>
          {notification?.type === "error" && notification.message}
        </p>
        {notification && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fermer la notification"
            className="size-9 shrink-0 rounded-md text-xl leading-none text-zinc-200 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
}
