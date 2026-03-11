import CustomerForm from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Add New Customer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fill in the information to create a new customer.</p>
      </div>
      <CustomerForm customer={null} />
    </div>
  );
}
