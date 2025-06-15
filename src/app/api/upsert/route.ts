// app/api/upsert-products/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

function extractGroupKey(basename: string): string {
  return basename.toLowerCase().replace(/\s+/g, '');
}

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/all-scrape`);
    const groupedData = await res.json();

    // 🔹 Step 1: Build product_groups table data
    const productGroups = groupedData.map((item: any) => ({
      group_key: extractGroupKey(item.basename),
      base_name: item.basename,
      price: item.price,
      stock: item.stock,
      category: item.category,
    }));

    // 🔹 Step 2: Build products table data (deduplicated by link)
    const seenLinks = new Set<string>();
    const allProducts = groupedData.flatMap((item: any) => {
      const group_key = extractGroupKey(item.basename);

      return item.products
        .map((product: any) => ({
          group_key,
          name: product.name,
          link: product.link,
          image: product.image,
          price: product.price,
          stock: product.stock,
          category: product.category,
          vendor: product.vendor,
        }))
        .filter((product: { link: string }) => {
          if (seenLinks.has(product.link)) return false;
          seenLinks.add(product.link);
          return true;
        });
    });

    // 🔥 Clear old data (during dev)
    await supabase.from('products').delete().neq('id', '');
    await supabase.from('product_groups').delete().neq('group_key', '');

    // 🔹 Step 3: Insert groups
    const { error: groupError } = await supabase
      .from('product_groups')
      .upsert(productGroups, { onConflict: 'group_key' });

    if (groupError) {
      return NextResponse.json({ success: false, error: groupError }, { status: 500 });
    }

    // 🔹 Step 4: Insert products
    const { error: productError } = await supabase
      .from('products')
      .upsert(allProducts, { onConflict: 'link' });

    if (productError) {
      return NextResponse.json({ success: false, error: productError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      groupsInserted: productGroups.length,
      productsInserted: allProducts.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
