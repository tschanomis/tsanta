import clsx from "clsx";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/data/users";
import { getUserItems } from "@/lib/data/items";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemReservation } from "@/components/item-reservation";
import { ItemControls } from "@/components/item-controls";
import { SortableItemList } from "@/components/sortable-item-list";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserList({ params }: UserPageProps) {
  const viewer = await requireUser();
  const { id } = await params;
  const owner = await getUserProfile(id);
  if (!owner) notFound();
  const items = await getUserItems(owner.id);

  const ownList = viewer.id === owner.id;
  const rows = items.map((item) => ({
    id: item.id,
    title: item.title,
    content: (
      <>
        <div className="flex items-center justify-between gap-3">
          <h2
            className={clsx(
              "min-w-0 wrap-break-word font-semibold",
              item.is_section
                ? "text-2xl tracking-tight sm:text-3xl"
                : "text-lg",
            )}
          >
            {item.title}
          </h2>
          {ownList && <ItemControls item={item} />}
          {!ownList && !item.is_section && (
            <ItemReservation item={item} viewerId={viewer.id} />
          )}
        </div>
        {item.is_section && (
          <hr className="mt-2 border-zinc-700" />
        )}
        {item.description && (
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-zinc-400">
            {item.description}
          </p>
        )}
        {item.url.map((url) => (
          <a
            key={url}
            href={url}
            title={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block w-fit max-w-full truncate text-sm text-emerald-400 underline underline-offset-4"
          >
            {new URL(url).hostname.replace(/^www\./, "")}{" "}
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        ))}
      </>
    ),
  }));

  return (
    <main className="flex flex-1 justify-center px-5 py-8 text-zinc-100 sm:py-12">
      <section className="w-full max-w-4xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-pink-400">
          Liste de cadeaux
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 wrap-break-word text-3xl font-semibold">
            {ownList ? "Ta liste" : `Liste ${owner.name}`}
          </h1>
          {ownList && <AddItemDialog />}
        </div>
        {rows.length === 0 ? (
          <p className="mt-6 text-zinc-400">Aucun cadeaux dans cette liste pour le moment.</p>
        ) : ownList ? (
          <SortableItemList items={rows} />
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map(({ id, content }) => (
              <li key={id} className="py-2">{content}</li>
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
