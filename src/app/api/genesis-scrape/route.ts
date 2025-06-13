import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  stock: string;
  image: string;
}

async function scrapeGenesisPCAll(page: puppeteer.Page): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const url = `https://www.genesispc.in/collections/all?page=${pageNum}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const productsOnPage = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div.grid.product-grid > a.grid__item, ul.grid > li.grid__item'));
      // fallback depending on grid structure
      return items.map((item) => {
        const name = item.querySelector('h3.card__heading, .card__heading')?.textContent?.trim() || 'No name';
        const href = item.getAttribute('href') || '';
        const link = href.startsWith('http') ? href : `https://www.genesispc.in${href}`;

        const priceEl = item.querySelector('.price-item--last, .price-item--regular');
        const price = priceEl?.textContent?.trim().replace(/\s+/g, ' ') || 'No price';

        const soldOut = !!item.querySelector('.sold-out, .badge--sold-out');
        const stock = soldOut ? 'outofstock' : 'instock';

        const imgEl = item.querySelector('img');
        let image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || 'No image';
        if (image.startsWith('//')) image = 'https:' + image;
        else if (image.startsWith('/')) image = `https://www.genesispc.in${image}`;

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
    const products = await scrapeGenesisPCAll(page);
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
