import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRegisteredUsers, getUserProfile, type UserProfile } from "@/lib/data/users";

async function RegisteredUsers() {
  let users: UserProfile[];
  try {
    users = await getRegisteredUsers();
  } catch {
    return <p role="alert" className="mt-5 text-sm text-red-400">Impossible de charger les inscrits. Réessayez plus tard.</p>;
  }

  if (users.length === 0) {
    return <p className="mt-5 text-zinc-400">Aucun utilisateur inscrit pour le moment.</p>;
  }

  return (
    <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <li key={user.id}>
          <Link href={`/utilisateurs/${user.id}`} className="flex h-full items-center gap-4 rounded-xl p-5 hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-lg font-semibold text-emerald-400">
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
  const profile = await getUserProfile(user.id);
  return (
    <main className="flex flex-1 justify-center px-5 py-8 text-zinc-100 sm:py-12">
      <section className="w-full max-w-4xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-pink-400">Liste de cadeaux</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Bienvenue{profile ? ` ${profile.name}` : ""}</h1>
        <section aria-labelledby="registered-users-title" className="mt-8">
          <h2 id="registered-users-title" className="text-xl font-semibold">Les inscrits</h2>
          <Suspense fallback={<p role="status" className="mt-5 text-zinc-400">Chargement des inscrits…</p>}>
            <RegisteredUsers />
          </Suspense>
        </section>
      </section>
    </main>
  );
}

export default function Home() {
  return <Suspense fallback={<p className="p-8 text-center" role="status">Chargement…</p>}><HomeContent /></Suspense>;
}
