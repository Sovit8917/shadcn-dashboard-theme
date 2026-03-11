import { redirect } from "next/navigation";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    redirect("/login");
  }
//
  redirect(`/api/auth/verify-email?token=${searchParams.token}&callbackURL=/login?verified=true`);
}
