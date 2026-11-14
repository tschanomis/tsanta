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
      <button className="rounded-md bg-emerald-800 shadow-[0_0_20px_#00ffc318] px-4 py-3 text-sm font-medium text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">Se déconnecter</button>
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
              <LogoutButton />
            </Suspense>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
