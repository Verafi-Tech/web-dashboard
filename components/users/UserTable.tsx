"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrgUser } from "@/lib/types/user";

const baseColumns: ColumnDef<OrgUser>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-foreground">{row.original.email}</div>
        <div className="text-xs text-muted-foreground">{row.original.full_name}</div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "success" : "draft"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "success" : "danger"}>
        {row.original.is_active ? "Active" : "Suspended"}
      </Badge>
    ),
  },
];

const actionsColumn: ColumnDef<OrgUser> = {
  id: "actions",
  header: "",
  cell: ({ row }) => (
    <div className="flex justify-end">
      <Link
        href={`/dashboard/users/${row.original.id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        View
      </Link>
    </div>
  ),
};

export function UserTable({
  data,
  showActions = true,
}: {
  data: OrgUser[];
  // The user profile page is admin-only (Phase 1) — callers viewing a
  // member list read-only (e.g. a non-admin on an org's Members tab) should
  // omit this rather than link to a page that'll just redirect them away.
  showActions?: boolean;
}) {
  const columns = useMemo(
    () => (showActions ? [...baseColumns, actionsColumn] : baseColumns),
    [showActions]
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = useMemo(
    () =>
      data.filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) return false;
        if (statusFilter === "active" && !user.is_active) return false;
        if (statusFilter === "suspended" && user.is_active) return false;
        return true;
      }),
    [data, roleFilter, statusFilter]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const user = row.original as OrgUser;
      return (
        user.email.toLowerCase().includes(search) ||
        user.full_name.toLowerCase().includes(search)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by email or name…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="max-w-36"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="field_agent">Field agent</option>
          <option value="viewer">Viewer</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-36"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No users match your filters.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
