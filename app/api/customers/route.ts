import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/postgres";
import { headers } from "next/headers";
import { customerSchema } from "@/lib/validation/authSchema";

async function requireAuth() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const params: (string | number)[] = [];
    let whereClause = "";
    if (search) { whereClause = "WHERE name ILIKE $1 OR email ILIKE $1 OR country ILIKE $1"; params.push(`%${search}%`); }

    const countResult = await pool.query(`SELECT COUNT(*) FROM customers ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({ customers: result.rows, total, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body   = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation failed" }, { status: 400 });

    const { name, email, country, phone, orders, total_spent, status } = parsed.data;
    const result = await pool.query(
      `INSERT INTO customers (name, email, country, phone, orders, total_spent, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, email, country, phone || "", orders, total_spent, status]
    );
    return NextResponse.json({ customer: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error.code === "23505") return NextResponse.json({ error: "A customer with this email already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
