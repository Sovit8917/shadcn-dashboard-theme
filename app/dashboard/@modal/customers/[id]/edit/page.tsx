import Modal from "@/components/Modal";
import CustomerForm from "@/components/CustomerForm";
import pool from "@/lib/postgres";
import { notFound } from "next/navigation";

async function getCustomer(id: string) {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function EditCustomerModal({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <Modal title="Edit Customer" description="Update the customer details below.">
      <CustomerForm customer={customer} />
    </Modal>
  );
}
