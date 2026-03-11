import pool from "@/lib/postgres";
import { notFound } from "next/navigation";
import CustomerForm from "@/components/CustomerForm";

async function getCustomer(id: string) {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Edit Customer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update the details for <span className="font-medium">{customer.name}</span>.
        </p>
      </div>
      <CustomerForm customer={customer} />
    </div>
  );
}
