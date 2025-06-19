import type { Metadata } from "next"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink } from "lucide-react"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"

interface PageProps {
  params: Promise<{
    basename: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const baseName = decodeURIComponent(resolvedParams.basename)
  return {
    title: baseName,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Decode URL param
  const resolvedParams = await params
  const baseName = decodeURIComponent(resolvedParams.basename)

  // 1️⃣ Fetch product group using base_name
  const { data: group, error: groupError } = await supabase
    .from("product_groups")
    .select("*")
    .eq("base_name", baseName)
    .single()

  if (groupError) {
    console.error("Error fetching group:", groupError)
    return (
      <MaxWidthWrapper className="py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Product</h3>
          <p className="text-gray-600">Unable to load the requested product group.</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  // 2️⃣ Fetch all products in this group
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, vendor")
    .eq("group_key", group.group_key)
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("Error fetching products:", productsError)
    return (
      <MaxWidthWrapper className="py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600">Unable to load products for this group.</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight break-words">
          {group.base_name}
        </h1>
      </div>

      {/* Table Container */}
      <div className="rounded-md border overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] sm:w-[45%] md:w-[50%] px-3 sm:px-4 py-3 text-left">
                <span className="text-xs sm:text-sm font-medium">Product Name</span>
              </TableHead>
              <TableHead className="w-[22%] sm:w-[20%] md:w-[18%] px-3 sm:px-4 py-3 text-left">
                <span className="text-xs sm:text-sm font-medium">Source</span>
              </TableHead>
              <TableHead className="w-[18%] sm:w-[17%] md:w-[16%] px-3 sm:px-4 py-3 text-right">
                <span className="text-xs sm:text-sm font-medium">Price</span>
              </TableHead>
              <TableHead className="w-[12%] sm:w-[13%] md:w-[11%] px-3 sm:px-4 py-3 text-right">
                <span className="text-xs sm:text-sm font-medium">Stock</span>
              </TableHead>
              <TableHead className="w-[8%] sm:w-[5%] md:w-[5%] px-3 sm:px-4 py-3 text-center">
                <span className="text-xs sm:text-sm font-medium sr-only sm:not-sr-only">Link</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  {/* Product Name */}
                  <TableCell className="w-[40%] sm:w-[45%] md:w-[50%] px-3 sm:px-4 py-4">
                    <div className="pr-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 leading-tight break-words word-break hyphens-auto line-clamp-2 sm:line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Source/Vendor */}
                  <TableCell className="w-[22%] sm:w-[20%] md:w-[18%] px-3 sm:px-4 py-4">
                    <div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium break-words word-break">
                        {product.vendor || "Unknown"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="w-[18%] sm:w-[17%] md:w-[16%] px-3 sm:px-4 py-4 text-right">
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                        {product.price}
                      </span>
                    </div>
                  </TableCell>

                  {/* Stock Status */}
                  <TableCell className="w-[12%] sm:w-[13%] md:w-[11%] px-3 sm:px-4 py-4 text-right">
                    <div className="flex justify-end">
                      <span
                        className={`
                          inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium
                          ${
                            product.stock === "instock"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        `}
                      >
                        <span className="hidden sm:inline whitespace-nowrap">
                          {product.stock === "instock" ? "In Stock" : "Out of Stock"}
                        </span>
                        <span className="sm:hidden">{product.stock === "instock" ? "✓" : "✗"}</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* Link */}
                  <TableCell className="w-[8%] sm:w-[5%] md:w-[5%] px-3 sm:px-4 py-4 text-center">
                    <Button asChild size="sm" variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-muted-foreground text-sm">No products found.</div>
                    <div className="text-xs text-muted-foreground">No variants are available for this product.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </MaxWidthWrapper>
  )
}
