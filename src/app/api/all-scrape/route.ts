import { NextResponse } from 'next/server';

// Helper to normalize product name
function extractbasenames(name: string) {
  const cleaned = name
    .replace(/\b(Hot-Swappable|Mechanical Keyboard|Keyboard|Tri-Mode|Gasket.*|Wired.*|with Knob|Wireless|75%|80%|96%?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    groupKey: cleaned.toLowerCase().replace(/\s+/g, ''),
    basename: cleaned.replace(/\b\w/g, l => l.toUpperCase()),
  };
}

// Extract numeric price from string like ₹5,500.00 or Rs. 5400
function getNumericPrice(price: string): number {
  const num = price.replace(/[^0-9.]/g, '');
  return parseFloat(num) || Infinity;
}

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const scraperVendors: Record<string, string> = {
      'ctrlshift-scrape': 'CtrlShift',
      'curiousity-scrape': 'Curiositycaps',
      'genesis-scrape': 'GenesisPC',
      'loadout-scrape': 'Loadout',
      'meckeys-scrape': 'Meckeys',
      'neomacro-scrape': 'NeoMacro',
      'stacks-scrape': 'StackSKB',
      'thockshop-scrape': 'TheThockshop',
    };

    const urls = Object.entries(scraperVendors).map(([key, vendor]) => ({
      url: `${base}/api/${key}`,
      vendor,
    }));

    const responses = await Promise.all(
      urls.map(({ url, vendor }) =>
        fetch(url)
          .then(res => res.ok ? res.json() : [])
          .then(data => data.map((item: any) => ({ ...item, vendor })))
          .catch(() => [])
      )
    );

    const combined = responses.flat();

    const groupedMap: Record<string, { basename: string; products: any[] }> = {};

    for (const product of combined) {
      const { groupKey, basename } = extractbasenames(product.name);

      if (!groupedMap[groupKey]) {
        groupedMap[groupKey] = { basename, products: [] };
      }

      groupedMap[groupKey].products.push(product);
    }

    const grouped = Object.values(groupedMap).map(({ basename, products }) => {
      const sortedProducts = products.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );

      const cheapestProduct = [...products].sort(
        (a, b) => getNumericPrice(a.price) - getNumericPrice(b.price)
      )[0];

      const stock =
        products.some((p) => p.stock?.toLowerCase() === 'instock') ||
        products.some((p) => p.stock?.toLowerCase() === 'in stock')
          ? 'instock'
          : 'outofstock';

      const category = cheapestProduct?.category || '';

      return {
        basename,
        price: cheapestProduct?.price || '',
        stock,
        category,
        products: sortedProducts,
      };
    });

    const groupedSorted = [
      ...grouped.filter((item) => item.stock === 'instock')
        .sort((a, b) => a.basename.localeCompare(b.basename, undefined, { sensitivity: 'base' })),
      ...grouped.filter((item) => item.stock === 'outofstock')
        .sort((a, b) => a.basename.localeCompare(b.basename, undefined, { sensitivity: 'base' }))
    ];

    return NextResponse.json(groupedSorted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to combine scrapers', details: (error as Error).message },
      { status: 500 }
    );
  }
}
