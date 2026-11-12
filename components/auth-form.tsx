"use client";

import { useActionState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { login, register } from "@/app/auth-actions";

export function AuthForm({ registration = false }: { registration?: boolean }) {
  const [state, action, pending] = useActionState(registration ? register : login, { error: "" });
  const inputClass = "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 focus:outline-2 focus:outline-emerald-700";
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12 text-zinc-900">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-700">SANTA</p>
        <h1 className="mt-3 text-3xl font-semibold">{registration ? "Créer mon compte" : "Se connecter"}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{registration ? "Votre adresse email doit être autorisée pour créer votre compte." : "Première visite ? Inscrivez-vous pour créer votre mot de passe."}</p>
        <form action={action} className="mt-7 space-y-5" aria-busy={pending}>
          {registration && (
            <label className="block text-sm font-medium">Nom
              <input className={inputClass} name="name" type="text" autoComplete="name" maxLength={100} required />
            </label>
          )}
          <label className="block text-sm font-medium">Adresse email
            <input className={inputClass} name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <label className="block text-sm font-medium">Mot de passe
            <input className={inputClass} name="password" type="password" autoComplete={registration ? "new-password" : "current-password"} minLength={12} maxLength={128} aria-describedby={registration ? "password-help" : undefined} required />
          </label>
          {registration && <>
            <p id="password-help" className="text-sm text-zinc-600">Entre 12 et 128 caractères. Privilégiez une phrase de passe unique.</p>
            <label className="block text-sm font-medium">Confirmer le mot de passe
              <input className={inputClass} name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
            </label>
          </>}
          <p role="alert" className="text-sm text-red-700">{state.error}</p>
          <button disabled={pending} className={clsx("w-full rounded-xl bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800", pending && "cursor-wait opacity-60")}>
            {pending ? "Veuillez patienter…" : registration ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          {registration ? "Déjà inscrit ? " : "Pas encore de compte ? "}
          <Link href={registration ? "/connexion" : "/inscription"} className="font-semibold text-emerald-800 underline underline-offset-4">{registration ? "Se connecter" : "S’inscrire"}</Link>
        </p>
      </section>
    </main>
  );
}
