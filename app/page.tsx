import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/auth-actions";
import { getRegisteredUsers, type UserProfile } from "@/lib/data/users";

async function RegisteredUsers() {
  let users: UserProfile[];
  try {
    users = await getRegisteredUsers();
  } catch {
    return <p role="alert" className="mt-5 text-sm text-red-700">Impossible de charger les inscrits. Réessayez plus tard.</p>;
  }

  if (users.length === 0) {
    return <p className="mt-5 text-zinc-600">Aucun utilisateur inscrit pour le moment.</p>;
  }

  return (
    <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <li key={user.id}>
          <Link href={`/utilisateurs/${user.id}`} className="flex h-full items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-800">
            {Array.from(user.name)[0].toLocaleUpperCase("fr")}
          </span>
          <p className="min-w-0 wrap-break-word font-medium">{user.name}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function HomeContent() {
  const user = await requireUser();
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12 text-zinc-900">
      <section className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-700">SANTA</p>
        <h1 className="mt-3 text-3xl font-semibold">Bienvenue dans votre espace</h1>
        <p className="mt-4 wrap-break-word text-zinc-600">Connecté avec {user.email}</p>
        <section aria-labelledby="registered-users-title" className="mt-8 border-t border-zinc-200 pt-8">
          <h2 id="registered-users-title" className="text-xl font-semibold">Les inscrits</h2>
          <Suspense fallback={<p role="status" className="mt-5 text-zinc-600">Chargement des inscrits…</p>}>
            <RegisteredUsers />
          </Suspense>
        </section>
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
