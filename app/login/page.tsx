"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import { loginSchema, LoginInput } from "@/lib/validation/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const emailVerified  = searchParams.get("verified")   === "true";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<Partial<Record<keyof LoginInput | "form", string>>>({});
  const [loading,  setLoading]  = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setNeedsVerification(false);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.errors.forEach((e) => {
        const k = e.path[0] as keyof LoginInput;
        if (!errs[k]) errs[k] = e.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    const { error } = await signIn.email({ email, password, callbackURL: "/dashboard" });
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes("verif")) setNeedsVerification(true);
      else setErrors({ form: error.message ?? "Sign in failed. Please try again." });
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleResend() {
    if (!email) { setErrors({ form: "Enter your email address first." }); return; }
    setResendLoading(true);
    const { error } = await sendVerificationEmail({ email, callbackURL: "/login?verified=true" });
    setResendLoading(false);
    if (error) setErrors({ form: error.message ?? "Failed to resend." });
    else setResendSuccess(true);
  }

  const err = (f: keyof LoginInput) =>
    errors[f] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-sm p-8">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">V</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              className={err("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••"
              value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              className={err("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {justRegistered && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
              <Mail className="w-4 h-4 shrink-0 mt-0.5" />
              Account created! Check your email to verify before signing in.
            </div>
          )}

          {emailVerified && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Email verified! You can now sign in.
            </div>
          )}

          {needsVerification && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3 space-y-2">
              <p className="font-medium">Email not verified</p>
              <p className="text-xs">Please verify your email before signing in.</p>
              {resendSuccess ? (
                <p className="text-xs text-green-700 font-medium">✓ Verification email sent!</p>
              ) : (
                <button type="button" onClick={handleResend} disabled={resendLoading}
                  className="text-xs underline hover:no-underline disabled:opacity-50">
                  {resendLoading ? "Sending…" : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          {errors.form && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.form}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
