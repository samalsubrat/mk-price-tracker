"use client";

import * as React from "react";
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
  name: string;
  link: string;
  price: string;
  category: string;
  stock: string;
  image: string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Keyboard Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        <a 
          href={row.original.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {row.getValue("name")}
        </a>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = row.getValue("price") as string;
      return <div className="text-right font-medium">{price}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">Stock</div>,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as string;
      return (
        <div className={`text-right font-medium ${
          stock === "instock" ? "text-green-600" : "text-red-600"
        }`}>
          {stock === "instock" ? "In Stock" : "Out of Stock"}
        </div>
      );
    },
  },
];

export function DataTableDemo() {
  const [data, setData] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        const apiEndpoints = [
          '/api/meckeys-scrape',
          '/api/thockshop-scrape',
        ];

        const responses = await Promise.all(
          apiEndpoints.map(endpoint => fetch(endpoint))
        );

        if (!isMounted) return;

        const allProducts = await Promise.all(
          responses.map(response => {
            if (!response.ok) return [];
            return response.json();
          })
        );

        if (!isMounted) return;

        // Flatten and filter for keyboard products
        const keyboardProducts = allProducts
          .flat()
          .filter((product: Product) => 
            product.category.toLowerCase().includes('keyboard')
          );

        setData(keyboardProducts);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  if (loading) {
    return (
      <MaxWidthWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading keyboards...</div>
        </div>
      </MaxWidthWrapper>
    );
  }

  if (error) {
    return (
      <MaxWidthWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search keyboards..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No keyboards found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
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
      </div>
    </MaxWidthWrapper>
  );
}

export default DataTableDemo;
