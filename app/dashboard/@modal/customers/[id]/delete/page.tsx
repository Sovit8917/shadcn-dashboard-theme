import pool from "@/lib/postgres";
import { notFound } from "next/navigation";
import Modal from "@/components/Modal";
import DeleteForm from "@/components/DeleteCustomerForm";

async function getCustomer(id: string) {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function DeleteCustomerModal({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <Modal title="Delete Customer" size="sm">
      <DeleteForm customer={customer} />
    </Modal>
  );
}
