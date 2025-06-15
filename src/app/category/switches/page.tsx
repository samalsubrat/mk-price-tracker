"use client"

import * as React from "react"
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"

import { columns, type Product } from "./column"

function SwitchesTable() {
  const supabase = React.useMemo(() => createClient(), [])
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  const [sorting, setSorting] = React.useState<SortingState>([{ id: "stock", desc: false }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from("product_groups")
        .select("base_name, price, stock")
        .or("category.ilike.%switch%,category.ilike.%switches%")

      if (error) {
        console.error("Supabase fetch error:", error.message)
      } else {
        setData(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

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
  })

  return (
    <MaxWidthWrapper>
      <div className="w-full space-y-4 py-4">
        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Search switches..."
            value={(table.getColumn("base_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("base_name")?.setFilterValue(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} switch(es) found
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={`
                          ${header.id === "base_name" ? "w-[50%] sm:w-[60%] md:w-[65%]" : "w-[25%] sm:w-[20%] md:w-[17.5%]"}
                          px-2 sm:px-4 text-xs sm:text-sm
                        `}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Loading switches...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`
                            px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm
                            ${
                              cell.column.id === "base_name"
                                ? "w-[50%] sm:w-[60%] md:w-[65%]"
                                : "w-[25%] sm:w-[20%] md:w-[17.5%]"
                            }
                          `}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-muted-foreground">No switches found.</div>
                        <div className="text-sm text-muted-foreground">Try adjusting your search terms.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>

          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2 sm:px-3"
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2 sm:px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}

export default SwitchesTable
