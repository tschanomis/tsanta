import type { Metadata } from "next";
import { Suspense } from "react";
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

async function LogoutButton() {
  const user = await currentUser();
  if (!user) return null;

  return (
    <form action={logout}>
      <button className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Se déconnecter</button>
    </form>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 bg-zinc-900 px-5 sm:px-8">
          <nav aria-label="Navigation principale" className="flex min-h-16 items-center justify-between gap-4">
            <Link href="/" className="rounded text-sm font-semibold tracking-widest text-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">SANTA</Link>
            <Suspense fallback={null}>
              <LogoutButton />
            </Suspense>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
