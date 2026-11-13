import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/data/users";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserList({ params }: UserPageProps) {
  const viewer = await requireUser();
  const { id } = await params;
  const owner = await getUserProfile(id);
  if (!owner) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12 text-zinc-900">
      <section className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-700">SANTA</p>
        <h1 className="mt-3 wrap-break-word text-3xl font-semibold">
          {viewer.id === owner.id ? "Ta liste" : `Liste ${owner.name}`}
        </h1>
        <Link
          href="/"
          className="mt-8 inline-block rounded font-semibold text-emerald-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
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
