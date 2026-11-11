import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { currentUser } from "@/lib/auth";

async function LoginPageContent() {
  if (await currentUser()) redirect("/");
  return <AuthForm />;
}

export default function LoginPage() {
  return <Suspense fallback={<p className="p-8 text-center" role="status">Chargement…</p>}><LoginPageContent /></Suspense>;
}
