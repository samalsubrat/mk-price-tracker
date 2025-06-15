"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Product {
  base_name: string
  price: string
  stock: string
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "base_name",
    header: () => "Mousepad Name",
    cell: ({ row }) => {
      const baseName = row.getValue("base_name") as string
      const slug = encodeURIComponent(baseName)
      return (
        <Link href={`/category/mousepads/${slug}`} className="block">
          <span className="text-blue-600 hover:text-blue-800 hover:underline font-medium line-clamp-2 sm:line-clamp-1">
            {baseName}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent justify-end w-full text-xs sm:text-sm"
      >
        Price
        <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as string
      return <div className="text-right font-medium text-sm sm:text-base">{price}</div>
    },
    sortingFn: (rowA, rowB, columnId) => {
      const getPrice = (val: string) => Number.parseFloat(val.replace(/[^0-9.]/g, "")) || Number.POSITIVE_INFINITY
      return getPrice(rowA.getValue(columnId)) - getPrice(rowB.getValue(columnId))
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent justify-end w-full text-xs sm:text-sm"
      >
        Stock
        <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as string
      const isInStock = stock === "instock"
      return (
        <div className="text-right">
          <span
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${
                isInStock
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }
            `}
          >
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) === "instock" ? 0 : 1
      const b = rowB.getValue(columnId) === "instock" ? 0 : 1
      return a - b
    },
  },
] 