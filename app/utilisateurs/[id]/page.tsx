import { Suspense } from "react";
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
    <main className="flex flex-1 justify-center px-5 py-8 text-zinc-100 sm:py-12">
      <section className="w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 wrap-break-word text-3xl font-semibold">
            {viewer.id === owner.id ? "Ta liste" : `Liste ${owner.name}`}
          </h1>
          {viewer.id === owner.id && <AddItemDialog />}
        </div>
        {items.length === 0 ? (
          <p className="mt-6 text-zinc-400">Aucun item dans cette liste pour le moment.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="py-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="min-w-0 wrap-break-word text-lg font-semibold">{item.title}</h2>
                  {viewer.id === owner.id && <ItemControls item={item} />}
                </div>
                {item.description && <p className="mt-2 whitespace-pre-wrap wrap-break-word text-zinc-400">{item.description}</p>}
                {item.url.map((url) => (
                  <a key={url} href={url} title={url} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate font-medium text-emerald-400 underline underline-offset-4">
                    {url} <span className="sr-only">(nouvel onglet)</span>
                  </a>
                ))}
              </li>
            ))}
          </ul>
        )}
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
