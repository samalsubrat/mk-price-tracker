// app/category/keyboards/[basename]/page.tsx
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{
    basename: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const baseName = decodeURIComponent(resolvedParams.basename);
  return {
    title: baseName,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Decode URL param
  const resolvedParams = await params;
  const baseName = decodeURIComponent(resolvedParams.basename);

  // 1️⃣ Fetch product group using base_name
  const { data: group, error: groupError } = await supabase
    .from("product_groups")
    .select("*")
    .eq("base_name", baseName)
    .single();

  if (groupError) {
    console.error("Error fetching group:", groupError);
    return <div>Error loading product group</div>;
  }

  // 2️⃣ Fetch all products in this group
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("group_key", group.group_key)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", productsError);
    return <div>Error loading products</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{group.base_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">Price: {product.price}</p>
            <p className={`mb-2 ${
              product.stock === "instock" ? "text-green-600" : "text-red-600"
            }`}>
              {product.stock === "instock" ? "In Stock" : "Out of Stock"}
            </p>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Product
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
