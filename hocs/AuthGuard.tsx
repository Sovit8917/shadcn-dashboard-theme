import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthRedirect from "@/components/AuthRedirect";
import { ReactNode } from "react";

// Protects pages that require authentication.
// If not logged in → redirects to /login
export default async function AuthGuard({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  return <>{session ? children : <AuthRedirect />}</>;
}
