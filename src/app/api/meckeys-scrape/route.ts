import { NextResponse } from "next/server";
import * as puppeteer from "puppeteer";

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

async function scrapeCategory(
  page: puppeteer.Page,
  url: string,
  categoryLabel: string
): Promise<Product[]> {
  await page.goto(url, { waitUntil: "networkidle2" });
  await scrollToBottom(page);

  const products = await page.evaluate((categoryLabel) => {
    const elements = document.querySelectorAll(".type-product");

    return Array.from(elements).map((el) => {
      const name = el.querySelector("h2")?.textContent?.trim() || "No name";
      const link = el.querySelector("a")?.href || "No link";
      const price =
        el
          .querySelector("ins .woocommerce-Price-amount")
          ?.textContent?.trim() ||
        el.querySelector(".woocommerce-Price-amount")?.textContent?.trim() ||
        "No price";

      // Get image from .img-wrap > img
      let image = "No image";
      const imgEl = el.querySelector(".img-wrap img");
      if (imgEl) {
        image =
          imgEl.getAttribute("src") ||
          imgEl.getAttribute("data-src") ||
          "No image";
        if (image.startsWith("//")) image = "https:" + image;
      }

      const classList = Array.from(el.classList);
      const stock = classList.includes("instock") ? "instock" : "outofstock";

      // Handle Keyboard category
      if (categoryLabel === "Keyboard") {
        const catClass = classList.find((cls) =>
          cls.startsWith("product_cat-")
        );
        const categoryMatch = catClass?.match(/product_cat-(\d+)-keyboard/);
        const category = categoryMatch
          ? `${categoryMatch[1]}% Keyboard`
          : "Barebones";
        return { name, link, price, category, image, stock };
      }

      // Handle Accessories category
      if (categoryLabel === "Accessories") {
        const catClass = classList.find((cls) =>
          cls.startsWith("product_cat-")
        );
        let category =
          catClass?.replace("product_cat-", "").replace(/-/g, " ") ||
          "Accessories";
        category = category.replace(/\b\w/g, (c) => c.toUpperCase());
        return { name, link, price, category, image, stock };
      }

      // Default category (Mouse, Deskmat, etc.)
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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const mouseUrl = "https://meckeys.com/category/mouse";
    const keyboardUrl = "https://meckeys.com/category/keyboard";
    const deskmatUrl = "https://meckeys.com/category/deskmat";
    const accessoriesUrl = "https://meckeys.com/category/accessories";

    const mouseProducts = await scrapeCategory(page, mouseUrl, "Mouse");
    const keyboardProducts = await scrapeCategory(
      page,
      keyboardUrl,
      "Keyboard"
    );
    const deskmatProducts = await scrapeCategory(page, deskmatUrl, "Deskmat");
    const accessoriesProducts = await scrapeCategory(
      page,
      accessoriesUrl,
      "Accessories"
    );

    await browser.close();

    const allProducts = [
      ...mouseProducts,
      ...keyboardProducts,
      ...deskmatProducts,
      ...accessoriesProducts,
    ];

    return NextResponse.json(allProducts, { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json(
      { error: "Scraping failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
