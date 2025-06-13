import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  category: string;
  stock: string;
  image: string;
}

async function scrapeAllStackSKBProducts(
  page: puppeteer.Page,
  baseUrl = 'https://stackskb.com/store/'
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore) {
    const url = pageNum === 1 ? baseUrl : `${baseUrl}page/${pageNum}/`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const products = await page.evaluate(() => {
      const productEls = Array.from(document.querySelectorAll('ul.products li.product'));

      return productEls.map((el) => {
        const name =
          el.querySelector('h2.woocommerce-loop-product__title')?.textContent?.trim() || 'No name';

        const link =
          (el.querySelector('a.woocommerce-LoopProduct-link') as HTMLAnchorElement)?.href ||
          'No link';

        const price = el.querySelector('.price')?.textContent?.trim().replace(/\s+/g, ' ') || 'No price';

        const classList = Array.from(el.classList);
        const stock = classList.includes('outofstock') ? 'outofstock' : 'instock';

        const categories = classList
          .filter((cls) => cls.startsWith('product_cat-'))
          .map((cls) =>
            cls
              .replace('product_cat-', '')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
          );
        const category = categories.join(', ') || 'Uncategorized';

        const imgEl = el.querySelector('img');
        let image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || 'No image';
        if (image.startsWith('//')) image = 'https:' + image;

        return { name, link, price, category, stock, image };
      });
    });

    if (products.length === 0) {
      hasMore = false;
    } else {
      allProducts.push(...products);
      pageNum++;
    }
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

    const products = await scrapeAllStackSKBProducts(page);

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
