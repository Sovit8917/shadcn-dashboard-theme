import Modal from "@/components/Modal";
import CustomerForm from "@/components/CustomerForm";

export default function NewCustomerModal() {
  return (
    <Modal
      title="Add New Customer"
      description="Fill in the information to create a new customer."
    >
      <CustomerForm customer={null} />
    </Modal>
  );
}
