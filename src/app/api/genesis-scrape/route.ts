import { NextResponse } from "next/server";
import * as puppeteer from "puppeteer";

interface Product {
  name: string;
  link: string;
  price: string;
  stock: string;
  image: string;
  category: string;
}

async function scrapeGenesisPC(
  page: puppeteer.Page,
  url: string,
  category: string
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let pageNum = 1;

  while (true) {
    const pageUrl = url.includes("?")
      ? `${url}&page=${pageNum}`
      : `${url}?page=${pageNum}`;
    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

    const products = await page.evaluate((category) => {
      const items = Array.from(
        document.querySelectorAll(
          "div.grid.product-grid > a.grid__item, ul.grid > li.grid__item"
        )
      );

      return items.map((item) => {
        const name =
          item
            .querySelector("h3.card__heading, .card__heading")
            ?.textContent?.trim() || "No name";

        const href =
          item.querySelector("h3.card__heading a")?.getAttribute("href") || "";
        const link = href.startsWith("http")
          ? href
          : `https://www.genesispc.in${href}`;

        let price =
          item
            .querySelector(".price-item--last, .price-item--regular")
            ?.textContent?.trim() || "No price";
        price = price.replace(/^From\s*/i, "").replace(/\.\d{2}$/, ""); // Clean "From", decimals

        const soldOut = !!item.querySelector(".badge--sold-out, .sold-out");
        const stock = soldOut ? "outofstock" : "instock";

        const imgEl = item.querySelector("img");
        let image =
          imgEl?.getAttribute("src") ||
          imgEl?.getAttribute("data-src") ||
          "No image";
        if (image.startsWith("//")) image = "https:" + image;
        else if (image.startsWith("/"))
          image = `https://www.genesispc.in${image}`;

        return { name, link, price, stock, image, category };
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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const categories = [
      {
        url: "https://www.genesispc.in/collections/keyboards",
        category: "Keyboards",
      },
      { url: "https://www.genesispc.in/collections/mouse", category: "Mouse" },
      {
        url: "https://www.genesispc.in/collections/mousepad",
        category: "Mousepad",
      },
      {
        url: "https://www.genesispc.in/collections/deskmats",
        category: "Deskmats",
      },
      {
        url: "https://www.genesispc.in/collections/mouse-skates",
        category: "Mouse Skates and Grips",
      },
      {
        url: "https://www.genesispc.in/collections/keycaps",
        category: "Keycaps",
      },
      {
        url: "https://www.genesispc.in/collections/tools-and-accessories",
        category: "Tools & Accessories",
      },
      {
        url: "https://www.genesispc.in/collections/switches-and-accessories",
        category: "Switches & Accessories",
      },
    ];

    let allProducts: Product[] = [];

    for (const { url, category } of categories) {
      const products = await scrapeGenesisPC(page, url, category);
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
