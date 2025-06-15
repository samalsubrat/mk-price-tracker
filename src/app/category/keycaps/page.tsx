"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

interface Product {
  base_name: string;
  price: string;
  stock: string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "base_name",
    header: () => "Keycap Name",
    size: 400,
    cell: ({ row }) => {
      const baseName = row.getValue("base_name") as string;
      const slug = encodeURIComponent(baseName);
      return (
        <Link href={`/category/keycaps/${slug}`}>
          <span className="text-blue-600 hover:underline font-medium">
            {baseName}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-end w-full"
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 150,
    cell: ({ row }) => {
      const price = row.getValue("price") as string;
      return <div className="text-right font-medium">{price}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const getPrice = (val: string) =>
        parseFloat(val.replace(/[^0-9.]/g, "")) || Infinity;
      return getPrice(rowA.getValue(columnId)) - getPrice(rowB.getValue(columnId));
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-end w-full"
      >
        Stock
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    size: 150,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as string;
      return (
        <div
          className={`text-right font-medium ${
            stock === "instock" ? "text-green-600" : "text-red-600"
          }`}
        >
          {stock === "instock" ? "In Stock" : "Out of Stock"}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) === "instock" ? 0 : 1;
      const b = rowB.getValue(columnId) === "instock" ? 0 : 1;
      return a - b;
    },
  },
];

function KeycapTable() {
  const supabase = React.useMemo(() => createClient(), []);
  const [data, setData] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "stock", desc: false }, // initial sort by stock
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("product_groups")
        .select("base_name, price, stock")
        .or("category.ilike.%keycaps%,category.ilike.%novelties%,category.ilike.%artisan%,category.ilike.%extras%,category.ilike.%group buys%,category.ilike.%clearance%");

      if (error) {
        console.error("Supabase fetch error:", error.message);
      } else {
        setData(data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <MaxWidthWrapper>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search keycaps..."
            value={(table.getColumn("base_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("base_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize(), whiteSpace: 'normal' }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize(), whiteSpace: 'normal' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No keycaps found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default KeycapTable; 