"use client";

import { useCallback, useEffect, useState } from "react";
import { Toast, type ToastMessage } from "@/components/toast";

const loginSuccess: ToastMessage = { type: "success", message: "Connexion réussie." };

export function LoginToast() {
  const [notification, setNotification] = useState<ToastMessage | null>(loginSuccess);
  const dismiss = useCallback(() => setNotification(null), []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("connexion") !== "reussie") return;
    url.searchParams.delete("connexion");
    window.history.replaceState(null, "", url);
  }, []);

  return <Toast notification={notification} onDismiss={dismiss} />;
}
