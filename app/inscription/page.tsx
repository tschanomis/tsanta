import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { currentUser } from "@/lib/auth";

async function RegisterPageContent() {
  if (await currentUser()) redirect("/");
  return <AuthForm registration />;
}

export default function RegisterPage() {
  return <Suspense fallback={<p className="p-8 text-center" role="status">Chargement…</p>}><RegisterPageContent /></Suspense>;
}
