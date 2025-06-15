import type { Metadata } from "next"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
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
        <div className="max-w-md mx-auto text-center">
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
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600">Unable to load products for this group.</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{group.base_name}</h1>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-300"
          >
            {/* Vendor Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-700 font-semibold text-sm uppercase tracking-wide">
                  {product.vendor || "Unknown Vendor"}
                </span>
              </div>
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${product.stock === "instock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                `}
              >
                {product.stock === "instock" ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Product Details */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2 leading-relaxed">{product.name}</h3>
                <div className="text-2xl font-bold text-gray-900">{product.price}</div>
              </div>

              <div className="flex-shrink-0">
                <Button asChild className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2">
                  <a href={product.link} target="_blank" rel="noopener noreferrer">
                    View Product
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">No variants are available for this product group.</p>
        </div>
      )}
    </MaxWidthWrapper>
  )
}
