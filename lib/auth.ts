import NextAuth from "next-auth";
import { cache } from "react";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { database } from "@/lib/db";
import { credentials } from "@/lib/credentials";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/connexion" },
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(values) {
      const input = credentials({ email: values.email, password: values.password });
      if (!input) return null;
      const result = await database().query<{
        id: string; email: string; name: string | null; password_hash: string; locked: boolean;
      }>(
        "SELECT id, email, name, password_hash, (locked_until > now()) AS locked FROM users WHERE email = $1",
        [input.email],
      );
      const user = result.rows[0];
      // Même calcul coûteux pour une adresse inconnue afin de limiter l’énumération.
      const valid = await verifyPassword(input.password, user?.password_hash ?? `${"0".repeat(32)}:${"0".repeat(128)}`);
      if (!user || user.locked) return null;
      if (!valid) {
        await database().query(
          `UPDATE users SET failed_attempts = CASE WHEN locked_until <= now() THEN 1 ELSE failed_attempts + 1 END,
           locked_until = CASE WHEN (CASE WHEN locked_until <= now() THEN 1 ELSE failed_attempts + 1 END) >= 5
           THEN now() + interval '15 minutes' ELSE NULL END WHERE id = $1`, [user.id],
        );
        return null;
      }
      await database().query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1", [user.id]);
      return { id: user.id, email: user.email, name: user.name };
    },
  })],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export const currentUser = cache(async (): Promise<{ id: string; email: string } | null> => {
  // NextAuth doit s’exécuter à la requête, après la phase de prérendu.
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;
  // Vérifier que le compte existe toujours, notamment après suppression de son invitation.
  const result = await database().query<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = $1", [session.user.id],
  );
  return result.rows[0] ?? null;
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  return user;
}
