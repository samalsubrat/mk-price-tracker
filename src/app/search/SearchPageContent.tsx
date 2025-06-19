"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { columns, type Product } from "../category/keyboards/column";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from("product_groups")
      .select("base_name, price, stock")
      .or([
        "category.ilike.%keyboard%",
        "category.ilike.%barebones%",
        "category.ilike.%mouse%",
        "category.ilike.%mice%",
        "category.ilike.%switch%",
        "category.ilike.%switches%",
        "category.ilike.%deskmat%",
        "category.ilike.%mousepad%",
        "category.ilike.%surface%",
        "category.ilike.%keycap%",
        "category.ilike.%keyset%",
        "category.ilike.%electronic parts%",
        "category.ilike.%parts parts%",
        "category.ilike.%electronic parts other%",
        "category.ilike.%fasteners stabilizers accessories parts%",
        "category.ilike.%pcbs more blank mouse accessories grip tape clearance%",
        "category.ilike.%foam accessories%",
        "category.ilike.%tools wrist rests accessories%",
        "category.ilike.%wrist rests hotswap sockets%",
        "category.ilike.%ncod%",
        "category.ilike.%parts group buys%",
        "category.ilike.%in stock extras parts clearance%",
        "category.ilike.%extras%",
        "category.ilike.%foam%",
        "category.ilike.%group buys%",
        "category.ilike.%in stock extras%",
        "category.ilike.%parts mouse skates and grips foam%",
        "category.ilike.%parts palm rest parts%",
        "category.ilike.%plates%",
        "category.ilike.%pcbs fasteners fasteners%",
        "category.ilike.%parts audio tools & accessories accessories%",
        "category.ilike.%deskmats accessories%",
        "category.ilike.%lubricants cases%",
        "category.ilike.%parts clearance%",
        "category.ilike.%in stock extras%",
        "category.ilike.%group buys%",
        "category.ilike.%accessories%",
        "category.ilike.%deskmats encoder electronic parts%",
        "category.ilike.%hotswap sockets%",
        "category.ilike.%parts tools%"
      ].join(","))
      .ilike("base_name", `%${query}%`)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setData(data || []);
        setLoading(false);
      });
  }, [query, supabase]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      {query ? (
        <p className="text-lg mb-6">Showing results for: <span className="font-semibold text-purple-600">{query}</span></p>
      ) : (
        <p className="text-lg text-gray-500 mb-6">No search query provided.</p>
      )}
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500">....</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : query && data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">...</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-muted-foreground">No products found.</div>
                      <div className="text-sm text-muted-foreground">Try adjusting your search terms.</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 