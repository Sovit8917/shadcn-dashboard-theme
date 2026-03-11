import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/authSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Zod validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return NextResponse.json({ error: errors[0].message, errors }, { status: 400 });
    }

    const { name, email, password } = result.data;

    // Use BetterAuth's internal API to create the user + send verification email
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: req.headers,
    });

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[register]", err);

    // BetterAuth throws if email already exists
    if (
      err?.message?.toLowerCase().includes("email") ||
      err?.body?.message?.toLowerCase().includes("email")
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
