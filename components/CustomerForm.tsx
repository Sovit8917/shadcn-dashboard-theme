"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { customerSchema, CustomerInput } from "@/lib/validation/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: number;
  name: string;
  email: string;
  country: string;
  phone: string;
  orders: number;
  total_spent: string;
  status: string;
  created_at: string;
}

const COUNTRIES = [
  "Australia", "Brazil", "Canada", "China", "France", "Germany",
  "India", "Japan", "Mexico", "Netherlands", "Singapore", "South Korea",
  "Spain", "United Kingdom", "United States",
];

type FieldErrors = Partial<Record<keyof CustomerInput, string>>;
interface Props { customer?: Customer | null; }

export default function CustomerForm({ customer }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!customer;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    name: "", email: "", country: "", phone: "",
    orders: "0", total_spent: "0", status: "active",
  });

  useEffect(() => {
    if (customer) setForm({
      name: customer.name, email: customer.email,
      country: customer.country, phone: customer.phone ?? "",
      orders: String(customer.orders), total_spent: String(customer.total_spent),
      status: customer.status,
    });
  }, [customer]);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): CustomerInput | null => {
    const result = customerSchema.safeParse({
      ...form,
      orders: parseInt(form.orders) || 0,
      total_spent: parseFloat(form.total_spent) || 0,
    });
    if (!result.success) {
      const errs: FieldErrors = {};
      result.error.errors.forEach((e) => {
        const k = e.path[0] as keyof CustomerInput;
        if (!errs[k]) errs[k] = e.message;
      });
      setErrors(errs);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const handleSubmit = async () => {
    const parsed = validate();
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/customers/${customer!.id}` : "/api/customers",
        { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) }
      );
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Something went wrong", variant: "destructive" });
        return;
      }
      toast({ title: isEdit ? "Customer updated" : "Customer created", description: `${parsed.name} has been ${isEdit ? "updated" : "added"}.` });
      router.back();
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (f: keyof CustomerInput) =>
    errors[f] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
          <Input id="name" placeholder="John Doe" value={form.name}
            onChange={(e) => set("name", e.target.value)} className={fieldErr("name")} />
          {errors.name && <p className="text-xs text-destructive">⚠ {errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input id="email" type="email" placeholder="john@example.com" value={form.email}
            onChange={(e) => set("email", e.target.value)} className={fieldErr("email")} />
          {errors.email && <p className="text-xs text-destructive">⚠ {errors.email}</p>}
        </div>

        {/* Country + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Country <span className="text-destructive">*</span></Label>
            <Select value={form.country} onValueChange={(v) => set("country", v)}>
              <SelectTrigger className={fieldErr("country")}><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.country && <p className="text-xs text-destructive">⚠ {errors.country}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1 555 000 0000" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} className={fieldErr("phone")} />
            {errors.phone && <p className="text-xs text-destructive">⚠ {errors.phone}</p>}
          </div>
        </div>

        {/* Orders + Total Spent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="orders">Orders</Label>
            <Input id="orders" type="number" min="0" value={form.orders}
              onChange={(e) => set("orders", e.target.value)} className={fieldErr("orders")} />
            {errors.orders && <p className="text-xs text-destructive">⚠ {errors.orders}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="total_spent">Total Spent ($)</Label>
            <Input id="total_spent" type="number" min="0" step="0.01" value={form.total_spent}
              onChange={(e) => set("total_spent", e.target.value)} className={fieldErr("total_spent")} />
            {errors.total_spent && <p className="text-xs text-destructive">⚠ {errors.total_spent}</p>}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className={fieldErr("status")}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-destructive">⚠ {errors.status}</p>}
        </div>
      </CardContent>

      <Separator />
      <CardFooter className="justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Add Customer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
