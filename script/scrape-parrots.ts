import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

interface ScrapedProduct {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  specs: { key: string; value: string }[];
}

const DISCOUNT_PERCENT = 75;

async function scrapeParrots(): Promise<ScrapedProduct[]> {
  console.log("🦜 Начинаю парсинг попугаев через браузер...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = "https://zolotoikakadu23.ru/parrot/";
    console.log(`📄 Загружаю ${url}...`);

    await page.goto(url, { waitUntil: "networkidle" });
    console.log("⏳ Жду загрузки товаров...");
    await page.waitForTimeout(5000);

    // Прокручиваем страницу полностью
    console.log("📜 Прокручиваю страницу...");
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let scrollCount = 0;
        const interval = setInterval(() => {
          window.scrollBy(0, window.innerHeight);
          scrollCount++;
          const newHeight = document.body.scrollHeight;
          if (newHeight === lastHeight || scrollCount > 20) {
            clearInterval(interval);
            resolve();
          }
          lastHeight = newHeight;
        }, 800);
      });
    });

    console.log("✓ Страница полностью прокручена");
    await page.waitForTimeout(3000);

    // Извлекаем товары
    const products = await page.evaluate(() => {
      const items: any[] = [];

      // Ищем все карточки товаров
      const productCards = document.querySelectorAll(".flexbe-card.zone-products");

      console.log(`Найдено карточек: ${productCards.length}`);

      productCards.forEach((card, idx) => {
        try {
          // Извлекаем название
          const nameEl = card.querySelector("h3, h2, [class*='title']");
          const name = nameEl?.textContent?.trim() || "";

          if (!name || name.length < 2) return;

          // Извлекаем цену из элемента с классом price
          let originalPrice = 0;
          const priceEl = card.querySelector(".ecommerce-price.price");
          if (priceEl) {
            const priceText = priceEl.textContent?.trim() || "";
            // Парсим цену вида "380 000 ₽"
            const priceMatch = priceText.match(/(\d+)\s*(\d+)\s*₽/);
            if (priceMatch) {
              const thousands = parseInt(priceMatch[1]) || 0;
              const hundreds = parseInt(priceMatch[2]) || 0;
              originalPrice = thousands * 1000 + hundreds;
            } else {
              // Если формат другой, ищем просто числа
              const numbers = priceText.match(/\d+/g) || [];
              if (numbers.length >= 2) {
                originalPrice = parseInt(numbers[0]) * 1000 + parseInt(numbers[1]);
              } else if (numbers.length === 1) {
                originalPrice = parseInt(numbers[0]);
              }
            }
          }

          if (!originalPrice || originalPrice < 100) {
            console.log(`⚠️ Карточка ${idx}: "${name}" - цена не найдена`);
            return;
          }

          // Извлекаем изображение
          let image = "";
          
          // Ищем в div с data-original (основной способ на этом сайте)
          const bgDiv = card.querySelector("[data-original]");
          if (bgDiv) {
            image = bgDiv.getAttribute("data-original") || "";
          }
          
          // Если не нашли, пробуем img теги
          if (!image) {
            const imgEl = card.querySelector("img");
            if (imgEl) {
              image = imgEl.getAttribute("src") ||
                      imgEl.getAttribute("data-src") ||
                      imgEl.getAttribute("data-lazy-src") ||
                      "";
            }
          }
          
          // Если не нашли, ищем в стилях background-image
          if (!image) {
            const styleDiv = card.querySelector("[style*='background-image']");
            if (styleDiv) {
              const style = styleDiv.getAttribute("style") || "";
              const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
              if (match) {
                image = match[1];
              }
            }
          }
          
          // Если URL относительный, делаем абсолютным
          if (image && !image.startsWith("http")) {
            image = new URL(image, "https://zolotoikakadu23.ru").href;
          }
          
          console.log(`  Изображение: ${image || "НЕ НАЙДЕНО"}`);

          // Извлекаем описание
          const descEl = card.querySelector("[class*='description'], p");
          const description = descEl?.textContent?.trim() || "";

          items.push({
            name,
            originalPrice,
            image,
            description,
          });

          console.log(`✓ Карточка ${idx}: "${name}" - ${originalPrice} ₽`);
        } catch (error) {
          console.error(`Ошибка при парсинге карточки ${idx}:`, error);
        }
      });

      return items;
    });

    console.log(`✓ Найдено товаров: ${products.length}`);

    // Обработка товаров
    const processedProducts: ScrapedProduct[] = products.map((item, index) => {
      const discountedPrice = Math.round(
        item.originalPrice * ((100 - DISCOUNT_PERCENT) / 100)
      );

      console.log(
        `✓ ${index + 1}. ${item.name} - ${discountedPrice} ₽ (было ${item.originalPrice} ₽)`
      );

      return {
        name: item.name,
        price: discountedPrice,
        originalPrice: item.originalPrice,
        image: item.image,
        description: item.description,
        specs: [
          { key: "Оригинальная цена", value: `${item.originalPrice} ₽` },
          { key: "Скидка", value: `${DISCOUNT_PERCENT}%` },
        ],
      };
    });

    return processedProducts;
  } finally {
    await browser.close();
  }
}

async function saveToJson(products: ScrapedProduct[], filename: string) {
  const filepath = path.join(process.cwd(), filename);
  fs.writeFileSync(filepath, JSON.stringify(products, null, 2), "utf-8");
  console.log(`\n💾 Сохранено в ${filename}: ${products.length} товаров`);
}

async function main() {
  try {
    const products = await scrapeParrots();

    if (products.length === 0) {
      console.warn("⚠️  Товары не найдены.");
      process.exit(1);
    }

    await saveToJson(products, "scraped-parrots.json");

    console.log("\n✅ Парсинг завершён!");
    console.log(`📊 Всего товаров: ${products.length}`);
    console.log(
      `💰 Средняя цена: ${Math.round(
        products.reduce((sum, p) => sum + p.price, 0) / products.length
      )} ₽`
    );
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

main();
