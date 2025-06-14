import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  image: string;
  category: string;
  stock: string;
}

async function scrapeNeoMacro(
  page: puppeteer.Page,
  url: string,
  category: string
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const pagedUrl = url.includes('?') ? `${url}&page=${pageNum}` : `${url}?page=${pageNum}`;
    await page.goto(pagedUrl, { waitUntil: 'domcontentloaded' });

   const products = await page.evaluate((category) => {
  const items = Array.from(document.querySelectorAll('ul#product-grid li.grid__item'));

  return items.map((item) => {
    const name =
      item.querySelector('h3.card__heading a')?.textContent?.trim() || 'No name';

    const link =
      'https://neomacro.in' +
      (item.querySelector('h3.card__heading a') as HTMLAnchorElement)?.getAttribute('href');

    let rawPrice =
      item.querySelector('.price__container .price-item--last')?.textContent?.trim() ||
      item.querySelector('.price__container .price-item--regular')?.textContent?.trim() ||
      'No price';

    // ✅ Normalize price
    let price = rawPrice.replace(/From\s*/i, '').replace(/\.00$/, '').trim();

    const imgSrc =
      (item.querySelector('.card__media img') as HTMLImageElement)?.getAttribute('src') || '';
    const image = imgSrc.startsWith('http') ? imgSrc : `https:${imgSrc}`;

    const stockBadge = item.querySelector('.card__badge.bottom.left')?.textContent?.toLowerCase();
    const stock = stockBadge?.includes('sold out') ? 'outofstock' : 'instock';

    return { name, link, price, image, category, stock };
  });
}, category);


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

    const categories = [
      { url: 'https://neomacro.in/collections/keyboards', category: 'Keyboards' },
      { url: 'https://neomacro.in/collections/mouse', category: 'Mouse' },
      { url: 'https://neomacro.in/collections/deskmats', category: 'Deskmats' },
      { url: 'https://neomacro.in/collections/accessories', category: 'Accessories' },
    ];

    let allProducts: Product[] = [];

    for (const { url, category } of categories) {
      const products = await scrapeNeoMacro(page, url, category);
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
