// src/components/keycaps/columns.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
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
