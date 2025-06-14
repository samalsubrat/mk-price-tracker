import { NextResponse } from 'next/server';

// Extract both groupKey and baseName from product name
function extractBaseNames(name: string) {
  // Remove common descriptors for grouping
  const cleaned = name
    .replace(/\b(Hot-Swappable|Mechanical Keyboard|Keyboard|Tri-Mode|Gasket.*|Wired.*|with Knob|Wireless|75%|80%|96%?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    groupKey: cleaned.toLowerCase().replace(/\s+/g, ''), // e.g., "aulaf75"
    baseName: cleaned.replace(/\b\w/g, l => l.toUpperCase()), // e.g., "Aula F75"
  };
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

      if (!groupedMap[groupKey]) {
        groupedMap[groupKey] = {
          baseName,
          products: [],
        };
      }

      groupedMap[groupKey].products.push(product);
    }

    const groupedSorted = Object.values(groupedMap)
      .map(({ baseName, products }) => ({
        baseName,
        products: products.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        ),
      }))
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
