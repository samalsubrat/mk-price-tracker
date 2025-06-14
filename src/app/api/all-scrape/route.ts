import { NextResponse } from 'next/server';

// Extract and normalize baseName
function extractBaseNames(name: string) {
  const cleaned = name
    .replace(/\b(Hot-Swappable|Mechanical Keyboard|Keyboard|Tri-Mode|Gasket.*|Wired.*|with Knob|Wireless|75%|80%|96%?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    groupKey: cleaned.toLowerCase().replace(/\s+/g, ''), // e.g., "aulaf75"
    baseName: cleaned.replace(/\b\w/g, (l) => l.toUpperCase()), // e.g., "Aula F75"
  };
}

// Get numeric price from string
function getNumericPrice(price: string): number {
  const num = price.replace(/[^0-9.]/g, '');
  return parseFloat(num) || Infinity;
}

// Custom vendor name extractor
function getVendor(link: string): string {
  try {
    const domain = new URL(link).hostname.replace('www.', '').split('.')[0];

    const knownVendors: Record<string, string> = {
      meckeys: 'Meckeys',
      neomacro: 'NeoMacro',
      ctrlshift: 'CtrlShiftStore',
      thockshop: 'Thockshop',
      stacks: 'StacksKB',
      stackskb: 'StacksKB',
      loadout: 'Loadout',
      curiousity: 'CuriousityCaps',
      genesispc: 'GenesisPC',
    };

    return knownVendors[domain.toLowerCase()] || domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
  } catch {
    return 'Unknown';
  }
}

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const urls = [
      `${base}/api/ctrlshift-scrape`,
      `${base}/api/curiousity-scrape`,
      `${base}/api/genesis-scrape`,
      `${base}/api/loadout-scrape`,
      `${base}/api/meckeys-scrape`,
      `${base}/api/neomacro-scrape`,
      `${base}/api/stacks-scrape`,
      `${base}/api/thockshop-scrape`,
    ];

    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      )
    );

    const combined = responses.flat();

    const groupedMap: Record<string, { baseName: string; products: any[] }> = {};

    for (const product of combined) {
      const { groupKey, baseName } = extractBaseNames(product.name);

      // Add vendor info
      product.vendor = getVendor(product.link);

      if (!groupedMap[groupKey]) {
        groupedMap[groupKey] = { baseName, products: [] };
      }

      groupedMap[groupKey].products.push(product);
    }

    const groupedSorted = Object.values(groupedMap)
      .map(({ baseName, products }) => {
        // Sort products with in-stock first, then alphabetically
        const sortedProducts = products.sort((a, b) => {
          const aStock = a.stock?.toLowerCase() === 'instock' ? 0 : 1;
          const bStock = b.stock?.toLowerCase() === 'instock' ? 0 : 1;

          if (aStock !== bStock) return aStock - bStock;
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });

        const cheapestProduct = [...products].sort(
          (a, b) => getNumericPrice(a.price) - getNumericPrice(b.price)
        )[0];

        const stock =
          products.some((p) => p.stock?.toLowerCase() === 'instock' || p.stock?.toLowerCase() === 'in stock')
            ? 'instock'
            : 'outofstock';

        return {
          baseName,
          price: cheapestProduct?.price || '',
          stock,
          products: sortedProducts,
        };
      })
      .sort((a, b) =>
        a.baseName.localeCompare(b.baseName, undefined, { sensitivity: 'base' })
      );

    return NextResponse.json(groupedSorted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to combine scrapers', details: (error as Error).message },
      { status: 500 }
    );
  }
}
