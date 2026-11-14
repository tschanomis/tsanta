import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/data/users";
import { getUserItems } from "@/lib/data/items";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemControls } from "@/components/item-controls";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserList({ params }: UserPageProps) {
  const viewer = await requireUser();
  const { id } = await params;
  const owner = await getUserProfile(id);
  if (!owner) notFound();
  const items = await getUserItems(owner.id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-12 text-zinc-100">
      <section className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-400">SANTA</p>
        <h1 className="mt-3 wrap-break-word text-3xl font-semibold">
          {viewer.id === owner.id ? "Ta liste" : `Liste ${owner.name}`}
        </h1>
        {viewer.id === owner.id && <AddItemDialog />}
        {items.length === 0 ? (
          <p className="mt-6 text-zinc-400">Aucun item dans cette liste pour le moment.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h2 className="wrap-break-word text-lg font-semibold">{item.title}</h2>
                {item.description && <p className="mt-2 whitespace-pre-wrap wrap-break-word text-zinc-400">{item.description}</p>}
                {item.url.map((url) => (
                  <a key={url} href={url} title={url} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate font-medium text-emerald-400 underline underline-offset-4">
                    {url} <span className="sr-only">(nouvel onglet)</span>
                  </a>
                ))}
                {viewer.id === owner.id && <ItemControls item={item} />}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/"
          className="mt-8 inline-block rounded font-semibold text-emerald-400 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
        >
          Retour aux inscrits
        </Link>
      </section>
    </main>
  );
}

export default function UserPage({ params }: UserPageProps) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Chargement de la liste…
        </p>
      }
    >
      <UserList params={params} />
    </Suspense>
  );
}
