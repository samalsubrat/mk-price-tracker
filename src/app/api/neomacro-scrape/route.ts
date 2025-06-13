import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  image: string;
}

async function scrapeNeoMacro(page: puppeteer.Page): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const url = `https://neomacro.in/collections/all-1?page=${pageNum}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ul#product-grid li.grid__item'));

      return items.map((item) => {
        const name =
          item.querySelector('h3.card__heading a')?.textContent?.trim() || 'No name';

        const link =
          'https://neomacro.in' +
          (item.querySelector('h3.card__heading a') as HTMLAnchorElement)?.getAttribute('href');

        const price =
          item.querySelector('.price__container .price-item--last')?.textContent?.trim() ||
          item.querySelector('.price__container .price-item--regular')?.textContent?.trim() ||
          'No price';

        const imgSrc =
          (item.querySelector('.card__media img') as HTMLImageElement)?.getAttribute('src') || '';
        const image = imgSrc.startsWith('http') ? imgSrc : `https:${imgSrc}`;

        return { name, link, price, image };
      });
    });

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
    const allProducts = await scrapeNeoMacro(page);
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
