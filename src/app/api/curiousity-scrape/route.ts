import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  image: string;
  stock: string;
}

async function scrapeCuriosityCaps(page: puppeteer.Page): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;
  let maxPage = Infinity;

  while (pageNum <= maxPage) {
    const url = `https://curiositycaps.in/collections/all?page=${pageNum}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (maxPage === Infinity) {
      const pagination = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('ul.pagination span, ul.pagination a'));
        const pageNumbers = spans.map(el => parseInt(el.textContent || '')).filter(n => !isNaN(n));
        return pageNumbers.length ? Math.max(...pageNumbers) : 21;
      });
      maxPage = pagination;
    }

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ul#product-grid > li'));
      return items.map(item => {
        const linkEl = item.querySelector('a.full-unstyled-link') as HTMLAnchorElement;
        const name = linkEl?.textContent?.trim() || 'No name';
        const link = linkEl?.href ? `https://curiositycaps.in${linkEl.getAttribute('href')}` : 'No link';

        const priceEl = item.querySelector('.price-item--sale, .price-item--regular');
        const price = priceEl?.textContent?.trim().replace(/\s+/g, ' ') || 'No price';

        const imgEl = item.querySelector('img');
        let image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || 'No image';
        if (image.startsWith('//')) image = 'https:' + image;

        const stock = item.querySelector('.sold-out-message')?.classList.contains('hidden') ? 'instock' : 'outofstock';

        return { name, link, price, image, stock };
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
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const products = await scrapeCuriosityCaps(page);
    await browser.close();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: 'Scraping failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
