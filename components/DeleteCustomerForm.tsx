"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/components/CustomerForm";

export default function DeleteCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Failed to delete", variant: "destructive" });
        return;
      }
      toast({ title: "Customer deleted", description: `${customer.name} has been removed.` });
      router.back();
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Warning */}
        <div className="flex gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <TriangleAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">This action cannot be undone</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently deletes <span className="font-semibold text-foreground">{customer.name}</span>&apos;s account and all associated data.
            </p>
          </div>
        </div>

        {/* Customer summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium truncate ml-4 text-right">{customer.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Orders</span>
            <span className="font-medium">{customer.orders}</span>
          </div>
        </div>
      </CardContent>

      <Separator />
      <CardFooter className="justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete Customer
        </Button>
      </CardFooter>
    </Card>
  );
}
