import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface Product {
  name: string;
  link: string;
  price: string;
  image: string;
  stock: string;
  category: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function scrapeLoadoutPage(page: puppeteer.Page, pageNum: number): Promise<Product[]> {
  const url = `https://www.loadout.co.in/category/all-products?page=${pageNum}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await delay(2000);

  const products = await page.evaluate(() => {
  const items = document.querySelectorAll('ul[data-hook="product-list-wrapper"] li[data-hook="product-list-grid-item"]');

  return Array.from(items).map((el) => {
    const name = el.querySelector('[data-hook="product-item-name"]')?.textContent?.trim() || 'No name';
    const link = el.querySelector('a[data-hook="product-item-container"]')?.getAttribute('href') || '';

    const discountedEl = el.querySelector('[data-hook="product-item-price-to-pay"]');
    let price = 'No price';
    if (discountedEl) {
      price = discountedEl.textContent?.trim().replace(/^From\s*/i, '') || 'No price';
    } else {
      const fallback = el.querySelector('[data-hook="product-item-price-before-discount"]');
      if (fallback) {
        price = fallback.textContent?.trim().replace(/^From\s*/i, '') || 'No price';
      }
    }

    const imgEl = el.querySelector('img');
    let image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || 'No image';
    if (image.startsWith('//')) image = 'https:' + image;
    else if (!image.startsWith('http')) image = 'https://www.loadout.co.in' + image;

    const stockText = el.innerHTML.toLowerCase();
    const stock = stockText.includes('sold out') ? 'outofstock' : 'instock';

    return {
      name,
      link: link.startsWith('http') ? link : `https://www.loadout.co.in${link}`,
      price,
      image,
      stock,
      category: 'All Products',
    };
  });
});


  return products;
}

export async function GET() {
  let browser: puppeteer.Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const allProducts: Product[] = [];

    let currentPage = 1;
    while (true) {
      const products = await scrapeLoadoutPage(page, currentPage);
      if (products.length === 0) {
        break;
      }
      allProducts.push(...products);
      currentPage++;
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
