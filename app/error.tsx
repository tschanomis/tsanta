"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <h1 className="text-2xl font-semibold">Service momentanément indisponible</h1>
      <p>Impossible de charger votre espace. Veuillez réessayer dans un instant.</p>
      <button onClick={reset} className="rounded-xl bg-emerald-800 px-5 py-3 text-white">Réessayer</button>
    </main>
  );
}
