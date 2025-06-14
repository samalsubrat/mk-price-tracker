import { NextResponse } from "next/server";

function getBaseName(name: string): string {
  return name
    .replace(
      /\s?(Hot-Swappable|Mechanical Keyboard|Keyboard|Tri-Mode|Gasket.*|Wired.*|with Knob|Wireless|75%|80%|96%?)?/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase(); // Lowercase for consistent grouping
}

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

    const groupedMap: Record<string, any[]> = {};

    for (const product of combined) {
      const key = getBaseName(product.name);

      if (!groupedMap[key]) {
        groupedMap[key] = [];
      }

      groupedMap[key].push(product);
    }

    // Convert the groupedMap to a sorted array of objects
    const groupedSorted = Object.entries(groupedMap)
      .map(([baseName, products]) => ({
        baseName: baseName.charAt(0).toUpperCase() + baseName.slice(1), // Aulaf75
        products: products.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        ),
      }))

      .sort((a, b) =>
        a.baseName.localeCompare(b.baseName, undefined, { sensitivity: "base" })
      );

    return NextResponse.json(groupedSorted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to combine scrapers",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
