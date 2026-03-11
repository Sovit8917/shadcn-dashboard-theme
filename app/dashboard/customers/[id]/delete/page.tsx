import pool from "@/lib/postgres";
import { notFound } from "next/navigation";
import DeleteCustomerForm from "@/components/DeleteCustomerForm";

async function getCustomer(id: string) {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function DeleteCustomerPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Delete Customer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review details before permanently removing this customer.</p>
      </div>
      <DeleteCustomerForm customer={customer} />
    </div>
  );
}
