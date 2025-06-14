import { NextResponse } from "next/server";
import * as puppeteer from "puppeteer";

interface Product {
  name: string;
  link: string;
  price: string;
  image: string;
  stock: string;
  category: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function scrapeLoadoutCategory(
  page: puppeteer.Page,
  categoryUrl: string,
  category: string
): Promise<Product[]> {
  const products: Product[] = [];
  let currentPage = 1;

  while (true) {
    const url = `${categoryUrl}?page=${currentPage}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    await delay(2000);

    const pageProducts = await page.evaluate((category) => {
      const items = document.querySelectorAll(
        'ul[data-hook="product-list-wrapper"] li[data-hook="product-list-grid-item"]'
      );

      return Array.from(items).map((el) => {
        const name =
          el
            .querySelector('[data-hook="product-item-name"]')
            ?.textContent?.trim() || "No name";

        const rawLink =
          el
            .querySelector('a[data-hook="product-item-container"]')
            ?.getAttribute("href") || "";
        const link = rawLink.startsWith("http")
          ? rawLink
          : `https://www.loadout.co.in${rawLink}`;

        const rawPrice =
          el.querySelector('[data-hook="product-item-price-to-pay"]')
            ?.textContent ||
          el.querySelector('[data-hook="product-item-price-before-discount"]')
            ?.textContent ||
          el.querySelector('[data-hook="product-item-price"]')?.textContent ||
          el.querySelector('[data-hook="price-range-from"]')?.textContent ||
          "";

        const match = rawPrice.match(/(Rs\.?|₹)\s?[\d,]+(\.\d{1,2})?/i);
        const price = match ? match[0].replace(/\s+/g, " ") : "No price";

        const imgEl = el.querySelector("img");
        let image =
          imgEl?.getAttribute("src") ||
          imgEl?.getAttribute("data-src") ||
          "https://www.loadout.co.in/no-image.jpg";

        if (image.startsWith("//")) image = "https:" + image;
        else if (!image.startsWith("http"))
          image = `https://www.loadout.co.in${image}`;

        const stockText = el.innerHTML.toLowerCase();
        const stock = stockText.includes("sold out") ? "outofstock" : "instock";

        return {
          name,
          link,
          price,
          image,
          stock,
          category,
        };
      });
    }, category);

    if (pageProducts.length === 0) break;
    products.push(...pageProducts);
    currentPage++;
  }

  return products;
}

export async function GET() {
  let browser: puppeteer.Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const categories = [
      {
        url: "https://www.loadout.co.in/category/keyboards",
        name: "Keyboards",
      },
      { url: "https://www.loadout.co.in/category/mice", name: "Mice" },
      {
        url: "https://www.loadout.co.in/category/magnesium-gaming-mouse",
        name: "Magnesium Mice",
      },
      { url: "https://www.loadout.co.in/category/mousepads", name: "Surfaces" },
      { url: "https://www.loadout.co.in/category/audio", name: "Audio" },
      {
        url: "https://www.loadout.co.in/category/accessories",
        name: "Accessories",
      },
    ];

    let allProducts: Product[] = [];

    for (const { url, name } of categories) {
      const products = await scrapeLoadoutCategory(page, url, name);
      allProducts.push(...products);
    }

    await browser.close();
    return NextResponse.json(allProducts, { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: "Scraping failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
