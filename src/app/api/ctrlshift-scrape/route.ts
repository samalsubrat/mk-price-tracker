import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  category: string;
  image: string;
  stock: string;
}

async function scrapeCtrlShiftCategory(
  page: puppeteer.Page,
  url: string,
  categoryLabel: string
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const pagedUrl = url.includes('?') ? `${url}&page=${pageNum}` : `${url}?page=${pageNum}`;
    await page.goto(pagedUrl, { waitUntil: 'domcontentloaded' });

    const products = await page.evaluate((categoryLabel) => {
      const items = Array.from(document.querySelectorAll('div.grid__item, li.grid__item'));

      return items.map((item) => {
        const linkEl = item.querySelector('a.full-unstyled-link') as HTMLAnchorElement | null;
        const href = linkEl?.getAttribute('href') || '';
        const link = href.startsWith('http') ? href : `https://ctrlshiftstore.com${href}`;

        const name = linkEl?.textContent?.trim() || 'No name';

        const priceEl = item.querySelector('.price-item--sale.price-item--last') ||
                        item.querySelector('.price-item.price-item--regular');
        let rawPrice = priceEl?.textContent?.trim() || 'No price';
        const price = rawPrice.replace(/From\s*/i, '').replace(/\.00$/, '').trim();

        const soldOut = !!item.querySelector('div.card__badge.bottom.right span.badge')?.textContent?.toLowerCase().includes('sold out');
        const stock = soldOut ? 'outofstock' : 'instock';

        const imgEl = item.querySelector('img');
        let image = imgEl?.getAttribute('src') ||
                    imgEl?.getAttribute('data-src') ||
                    'No image';
        if (image.startsWith('//')) image = 'https:' + image;
        else if (image.startsWith('/')) image = `https://ctrlshiftstore.com${image}`;

        return { name, link, price, image, category: categoryLabel, stock };
      });
    }, categoryLabel);

    if (products.length === 0) break;

    allProducts.push(...products);
    pageNum++;
  }

  return allProducts;
}

export async function GET() {
  let browser: puppeteer.Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const ctrlShiftUrls = [
      { url: 'https://ctrlshiftstore.com/collections/keyboards', category: 'Keyboards' },
      { url: 'https://ctrlshiftstore.com/collections/switches', category: 'Switches' },
      { url: 'https://ctrlshiftstore.com/collections/barebones', category: 'Barebones' },
      { url: 'https://ctrlshiftstore.com/collections/keycaps', category: 'Keycaps' },
      { url: 'https://ctrlshiftstore.com/collections/deskmats', category: 'Deskmats' },
    ];

    const allProducts: Product[] = [];

    for (const { url, category } of ctrlShiftUrls) {
      const products = await scrapeCtrlShiftCategory(page, url, category);
      allProducts.push(...products);
    }

    await browser.close();

    return NextResponse.json(allProducts, { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: 'Scraping failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
