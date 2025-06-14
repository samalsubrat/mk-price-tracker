import { NextResponse } from 'next/server';

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
          .then((res) => res.ok ? res.json() : [])
          .catch(() => [])
      )
    );

    const combined = responses.flat();

    // ✅ Sort combined results alphabetically by product name (case-insensitive)
    combined.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to combine scrapers', details: (error as Error).message },
      { status: 500 }
    );
  }
}
