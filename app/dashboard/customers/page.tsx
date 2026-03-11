"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useReactTable, getCoreRowModel, flexRender,
  ColumnDef, PaginationState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Plus, Download, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Users,
} from "lucide-react";
import type { Customer } from "@/components/CustomerForm";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700",
    "bg-red-100 text-red-700", "bg-indigo-100 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
    inactive: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
  };
  return (
    <Badge variant="outline" className={variants[status] || variants.inactive}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "active" ? "bg-green-500" : status === "pending" ? "bg-yellow-500" : "bg-gray-400"}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getFlagEmoji(country: string): string {
  const flags: Record<string, string> = {
    "Australia": "🇦🇺", "Brazil": "🇧🇷", "Canada": "🇨🇦", "China": "🇨🇳",
    "France": "🇫🇷", "Germany": "🇩🇪", "India": "🇮🇳", "Japan": "🇯🇵",
    "Mexico": "🇲🇽", "Netherlands": "🇳🇱", "Singapore": "🇸🇬", "South Korea": "🇰🇷",
    "Spain": "🇪🇸", "United Kingdom": "🇬🇧", "United States": "🇺🇸",
  };
  return flags[country] || "🌍";
}

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(search && { search }),
      });
      const res = await fetch(`/api/customers?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.customers);
        setTotal(json.total);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(c.name)}`}>
                {getInitials(c.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">#{String(row.original.id).padStart(6, "0")}</span>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{getFlagEmoji(row.original.country)}</span>
          <span className="text-sm hidden sm:block">{row.original.country || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "orders",
      header: "Orders",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.orders.toLocaleString()}</span>,
    },
    {
      accessorKey: "total_spent",
      header: "Total Spent",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          ${parseFloat(row.original.total_spent).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.push(`/dashboard/customers/${row.original.id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => router.push(`/dashboard/customers/${row.original.id}/delete`)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const pageCount = Math.ceil(total / pagination.pageSize);

  const handleExport = () => {
    const csv = [
      ["ID", "Name", "Email", "Country", "Phone", "Orders", "Total Spent", "Status"],
      ...data.map((c) => [c.id, c.name, c.email, c.country, c.phone || "", c.orders, c.total_spent, c.status]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your customer database</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => router.push("/dashboard/customers/new")}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Table card */}
      <Card>
        {/* Toolbar */}
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search customers..."
                className="pl-9 h-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: parseInt(v), pageIndex: 0 }))}
              >
                <SelectTrigger className="w-[70px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Scrollable table wrapper */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" /><span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center text-muted-foreground text-sm">
                      {search ? `No customers found matching "${search}"` : "No customers yet. Add your first customer!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              {total === 0
                ? "No entries"
                : `Showing ${pagination.pageIndex * pagination.pageSize + 1}–${Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of ${total}`}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let pageNum = i;
                if (pageCount > 5) {
                  const start = Math.max(0, Math.min(pagination.pageIndex - 2, pageCount - 5));
                  pageNum = start + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.pageIndex === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-sm"
                    onClick={() => table.setPageIndex(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
