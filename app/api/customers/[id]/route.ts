import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/postgres";
import { headers } from "next/headers";
import { customerSchema, customerIdSchema } from "@/lib/validation/authSchema";
import { z } from "zod";

async function requireAuth() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const id     = customerIdSchema.parse(params.id);
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ customer: result.rows[0] });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const id     = customerIdSchema.parse(params.id);
    const body   = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation failed" }, { status: 400 });

    const { name, email, country, phone, orders, total_spent, status } = parsed.data;
    const result = await pool.query(
      `UPDATE customers SET name=$1,email=$2,country=$3,phone=$4,orders=$5,total_spent=$6,status=$7,updated_at=NOW() WHERE id=$8 RETURNING *`,
      [name, email, country, phone || "", orders, total_spent, status, id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ customer: result.rows[0] });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    if (error.code === "23505") return NextResponse.json({ error: "A customer with this email already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const id     = customerIdSchema.parse(params.id);
    const result = await pool.query("DELETE FROM customers WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
