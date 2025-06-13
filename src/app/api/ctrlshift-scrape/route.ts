import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  stock: string;
  image: string;
}

async function scrapeCtrlShiftAll(page: puppeteer.Page): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const url = `https://ctrlshiftstore.com/collections/all?page=${pageNum}`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const productsOnPage = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div.grid__item, li.grid__item'));

      return items.map((item) => {
        const linkEl = item.querySelector('a.full-unstyled-link') as HTMLAnchorElement | null;
        const href = linkEl?.getAttribute('href') || '';
        const link = href.startsWith('http') ? href : `https://ctrlshiftstore.com${href}`;

        const name = linkEl?.textContent?.trim() || 'No name';

        const priceEl = item.querySelector('.price-item--sale.price-item--last') ||
                        item.querySelector('.price-item.price-item--regular');
        const price = priceEl?.textContent?.trim().replace(/\s+/g, ' ') || 'No price';

        const soldOut = !!item.querySelector('.badge--sold-out, .product-item__badge--sold-out');
        const stock = soldOut ? 'outofstock' : 'instock';

        const imgEl = item.querySelector('img');
        let image = imgEl?.getAttribute('src') ||
                    imgEl?.getAttribute('data-src') ||
                    'No image';
        if (image.startsWith('//')) image = 'https:' + image;
        else if (image.startsWith('/')) image = `https://ctrlshiftstore.com${image}`;

        return { name, link, price, stock, image };
      });
    });

    if (productsOnPage.length === 0) break;

    allProducts.push(...productsOnPage);
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
    const products = await scrapeCtrlShiftAll(page);
    await browser.close();

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: 'Scraping failed', details: (err as Error).message },
      { status: 500 }
    );
  }
}
