import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/auth-actions";

async function HomeContent() {
  const user = await requireUser();
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 text-zinc-900">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-widest text-emerald-700">SANTA</p>
        <h1 className="mt-3 text-3xl font-semibold">Bienvenue dans votre espace</h1>
        <p className="mt-4 break-words text-zinc-600">Connecté avec {user.email}</p>
        <form action={logout} className="mt-8">
          <button className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900">Se déconnecter</button>
        </form>
      </section>
    </main>
  );
}

export default function Home() {
  return <Suspense fallback={<p className="p-8 text-center" role="status">Chargement…</p>}><HomeContent /></Suspense>;
}
