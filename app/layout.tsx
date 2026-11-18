import type { Metadata } from "next";
import clsx from "clsx";
import { Suspense, useId } from "react";
import { currentUser } from "@/lib/auth";
import { logout } from "@/app/auth-actions";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santa",
  description: "Votre espace Santa",
};

async function AccountNavigation() {
  const user = await currentUser();
  if (!user) return null;

  return <AccountMenu name={user.name?.trim() || user.email} email={user.email} />;
}

function AccountMenu({ name, email }: { name: string; email: string }) {
  const menuId = useId();
  const initial = Array.from(name)[0]?.toLocaleUpperCase("fr");
  const avatarClass =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-800 font-semibold text-white";

  return (
    <div className="group relative flex">
      <button
        type="button"
        popoverTarget={menuId}
        aria-label="Menu du compte"
        className={clsx(avatarClass, "cursor-pointer shadow-[0_0_20px_#00ffc318] transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400")}
      >
        {initial}
      </button>
      <span aria-hidden="true" className="pointer-events-none absolute top-full right-0 z-10 mt-2 hidden w-max max-w-60 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-normal wrap-break-word text-zinc-100 shadow-lg group-hover:block group-focus-within:block group-has-[:popover-open]:hidden">
        Ouvrir le menu du compte
      </span>
      <div
        id={menuId}
        popover="auto"
        className="fixed inset-auto m-0 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-zinc-100 shadow-xl [position-area:bottom_span-left] [position-try-fallbacks:flip-inline]"
      >
        <div className="flex items-center gap-3 border-b border-zinc-700 px-3 py-3">
          <span aria-hidden="true" className={avatarClass}>{initial}</span>
          <div className="min-w-0 wrap-break-word">
            <p className="font-bold">{name}</p>
            <p className="text-sm text-zinc-400">{email}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-emerald-950 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l5 5-5 5m5-5H9m0-9H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
            </svg>
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 bg-zinc-950/90 px-5 shadow-[0_4px_32px_#00ffc30a] backdrop-blur-xl sm:px-8">
          <nav aria-label="Navigation principale" className="flex min-h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 rounded font-mono text-xl font-black tracking-[0.22em] text-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
              <svg aria-hidden="true" viewBox="0 0 32 40" fill="none" className="h-9 w-7 drop-shadow-[0_0_8px_#64ffc480]">
                <path d="m16 3 6 9h-4l8 10h-6l9 10H3l9-10H6l8-10h-4l6-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M16 32v6" stroke="currentColor" strokeWidth="2" />
                <circle cx="13" cy="17" r="1.5" fill="#ff749c" />
                <circle cx="20" cy="27" r="1.5" fill="#ff749c" />
              </svg>
              SANTA<span aria-hidden="true" className="text-pink-400">_</span>
            </Link>
            <Suspense fallback={null}>
              <AccountNavigation />
            </Suspense>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
