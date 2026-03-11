import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import GuestRedirect from "@/components/GuestRedirect";
import { ReactNode } from "react";

// Protects pages that should only be seen when NOT logged in.
// If already logged in → redirects to /dashboard
export default async function GuestGuard({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  return <>{session ? <GuestRedirect /> : children}</>;
}
