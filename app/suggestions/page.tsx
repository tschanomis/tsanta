import clsx from "clsx";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getSuggestions } from "@/lib/data/suggestions";
import { DeleteMessage, MessageForm } from "./message-form";
import { isTheme, themes } from "./themes";

export const metadata = { title: "Suggestions | Santa" };

const batchSize = 10;

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

async function Forum({ searchParams }: PageProps<"/suggestions">) {
  const user = await requireUser();
  const { theme, count } = await searchParams;
  const selected = isTheme(theme) ? theme : "evenements";
  const requestedCount = typeof count === "string" && /^[1-9]\d*$/.test(count) ? Number(count) : 0;
  const validCount =
    Number.isSafeInteger(requestedCount) &&
    requestedCount >= batchSize &&
    requestedCount % batchSize === 0;
  const limit = validCount ? requestedCount : batchSize;
  const { messages, hasMore } = await getSuggestions(selected, limit);

  return (
    <>
      <nav aria-label="Thèmes des suggestions" className="flex flex-wrap gap-2">
        {Object.entries(themes).map(([key, label]) => (
          <Link
            key={key}
            href={{ pathname: "/suggestions", query: { theme: key } }}
            aria-current={selected === key ? "page" : undefined}
            className={clsx(
              "rounded-md px-3 py-2 text-sm font-medium",
              selected === key
                ? "bg-emerald-900 text-emerald-100"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="grid gap-5" aria-labelledby="forum-theme">
        <h2 id="forum-theme" className="text-xl font-semibold">
          {themes[selected]}
        </h2>
        <MessageForm key={selected} theme={selected} />
        {messages.length === 0 ? (
          <p className="text-zinc-400">Aucun message dans ce thème pour le moment.</p>
        ) : (
          <ul className="grid gap-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="min-w-0 wrap-break-word font-semibold">{message.author}</p>
                  <time
                    dateTime={message.created_at.toISOString()}
                    className="text-sm text-zinc-400"
                  >
                    {dateFormat.format(message.created_at)}
                  </time>
                  {message.updated_at && <span className="text-sm text-zinc-400">Modifié</span>}
                </div>
                <p className="mt-2 whitespace-pre-wrap wrap-break-word">{message.body}</p>
                {message.user_id === user.id && (
                  <>
                    <details key={message.updated_at?.toISOString()} className="mt-3">
                      <summary className="w-fit cursor-pointer text-sm font-medium text-emerald-400">
                        Modifier
                      </summary>
                      <div className="mt-3">
                        <MessageForm theme={selected} id={message.id} initialBody={message.body} />
                      </div>
                    </details>
                    <DeleteMessage id={message.id} />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
          <Link
            href={{
              pathname: "/suggestions",
              query: { theme: selected, count: limit + batchSize },
            }}
            scroll={false}
            prefetch={false}
            className="w-fit rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            Charger plus
          </Link>
        )}
      </section>
    </>
  );
}

export default function SuggestionsPage(props: PageProps<"/suggestions">) {
  return (
    <main className="mx-auto grid w-full max-w-3xl content-start gap-6 px-5 py-8 text-zinc-100 sm:py-12">
      <h1 className="text-3xl font-semibold">Suggestions</h1>
      <Suspense
        fallback={
          <p role="status" className="text-zinc-400">
            Chargement des suggestions…
          </p>
        }
      >
        <Forum {...props} />
      </Suspense>
    </main>
  );
}
