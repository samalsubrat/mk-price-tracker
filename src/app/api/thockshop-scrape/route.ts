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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function scrollToBottom(page: puppeteer.Page) {
  let previousHeight = 0;
  while (true) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(2000);
  }
}

async function scrapeCategory(page: puppeteer.Page, url: string, categoryLabel: string): Promise<Product[]> {
  await page.goto(url, { waitUntil: 'networkidle2' });
  await scrollToBottom(page);

  const products = await page.evaluate((categoryLabel) => {
    const cards = Array.from(document.querySelectorAll('.product-card'));

    return cards.map((card) => {
      const name = card.querySelector('div.text-lg > span')?.textContent?.trim() || 'No name';
      const relativeLink = card.querySelector('a')?.getAttribute('href') || '';
      const link = 'https://www.thethockshop.com' + relativeLink;

      const imgSrc = card.querySelector('img')?.getAttribute('src') || '';
      const image = imgSrc.startsWith('http') ? imgSrc : 'https://www.thethockshop.com' + imgSrc;

      const allSpans = card.querySelectorAll('.text-black');
      let price = 'No price';
      for (const span of allSpans) {
        const text = span.textContent?.trim();
        if (text && /(₹|Rs\.?)(\s)?\d/.test(text)) {
          price = text.replace(/,/g, '').replace(/\s+/g, ' ');
          break;
        }
      }

      const stockLabel = card.querySelector('span.text-xs span.font-bold')?.textContent?.trim().toLowerCase();
      let stock = 'unknown';
      if (stockLabel === 'out of stock') stock = 'outofstock';
      else if (stockLabel === 'in stock') stock = 'instock';

      return { name, link, price, category: categoryLabel, image, stock };
    });
  }, categoryLabel);

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

    const urls = [
      { url: 'https://www.thethockshop.com/shop/keyboards', label: 'Keyboard' },
      { url: 'https://www.thethockshop.com/shop/switches', label: 'Switches' },
      { url: 'https://www.thethockshop.com/shop/barebones', label: 'Barebones' },
      { url: 'https://www.thethockshop.com/shop/keycaps', label: 'Keycaps' },
    ];

    const results: Product[] = [];

    for (const { url, label } of urls) {
      const categoryProducts = await scrapeCategory(page, url, label);
      results.push(...categoryProducts);
    }

    await browser.close();

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: 'Scraping failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
