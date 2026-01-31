import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import type { IncomingMessage } from "http";
import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const IMAGES_DIR = path.join(process.cwd(), "client/public/images/products");
const DONOR_URL = "https://zolotoikakadu23.ru/parrot/";
const DOWNLOAD_TIMEOUT = 10000;

interface ProductImages {
  productId: number;
  productName: string;
  mainImage: string;
  allImages: string[];
}

interface DownloadStats {
  totalDownloaded: number;
  totalUpdated: number;
  totalFailed: number;
}

// Скачивание изображения с обработкой ошибок
async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filename);

    const request = protocol.get(
      url,
      { timeout: DOWNLOAD_TIMEOUT },
      (response: IncomingMessage) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(true);
          });
        } else {
          file.close();
          fs.unlink(filename, () => {});
          resolve(false);
        }
      }
    );

    request.on("error", () => {
      file.close();
      fs.unlink(filename, () => {});
      resolve(false);
    });

    request.on("timeout", () => {
      request.destroy();
      file.close();
      fs.unlink(filename, () => {});
      resolve(false);
    });
  });
}

// Парсинг сайта для получения всех изображений товаров
async function scrapeAllProductImages(): Promise<ProductImages[]> {
  console.log("🌐 Подключаюсь к сайту-донору для получения всех изображений...\n");

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    await page.goto(DONOR_URL, { waitUntil: "networkidle" });
    console.log("⏳ Загружаю товары...");
    await page.waitForTimeout(3000);

    // Прокручиваем страницу полностью
    console.log("📜 Прокручиваю страницу для загрузки всех товаров...");
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let scrollCount = 0;
        const interval = setInterval(() => {
          window.scrollBy(0, window.innerHeight);
          scrollCount++;
          const newHeight = document.body.scrollHeight;
          if (newHeight === lastHeight || scrollCount > 30) {
            clearInterval(interval);
            resolve();
          }
          lastHeight = newHeight;
        }, 500);
      });
    });

    console.log("✓ Страница полностью загружена\n");

    // Извлекаем все изображения для каждого товара
    const productImages = await page.evaluate(() => {
      const items: ProductImages[] = [];
      const productCards = document.querySelectorAll(".flexbe-card.zone-products");

      productCards.forEach((card, idx) => {
        try {
          // Название товара
          const nameEl = card.querySelector("h3, h2, [class*='title']");
          const name = nameEl?.textContent?.trim() || "";

          if (!name || name.length < 2) return;

          // Основное изображение
          let mainImage = "";
          const bgDiv = card.querySelector("[data-original]");
          if (bgDiv) {
            mainImage = bgDiv.getAttribute("data-original") || "";
          }
          if (!mainImage) {
            const imgEl = card.querySelector("img");
            if (imgEl) {
              mainImage =
                imgEl.getAttribute("src") ||
                imgEl.getAttribute("data-src") ||
                imgEl.getAttribute("data-lazy-src") ||
                "";
            }
          }
          if (mainImage && !mainImage.startsWith("http")) {
            mainImage = new URL(mainImage, "https://zolotoikakadu23.ru").href;
          }

          // Все изображения в карточке (если есть галерея)
          const allImages: string[] = [];
          if (mainImage) {
            allImages.push(mainImage);
          }

          // Ищем дополнительные изображения в галерее
          const galleryImages = card.querySelectorAll("[data-original]");
          galleryImages.forEach((img) => {
            const src = img.getAttribute("data-original") || "";
            if (src && !allImages.includes(src)) {
              const fullUrl = src.startsWith("http")
                ? src
                : new URL(src, "https://zolotoikakadu23.ru").href;
              allImages.push(fullUrl);
            }
          });

          items.push({
            productId: idx,
            productName: name,
            mainImage,
            allImages: allImages.length > 0 ? allImages : [mainImage],
          });
        } catch (error) {
          console.error(`Ошибка при парсинге товара ${idx}:`, error);
        }
      });

      return items;
    });

    console.log(`✓ Найдено товаров на сайте: ${productImages.length}\n`);
    return productImages;
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

// Основная функция синхронизации
async function main(): Promise<void> {
  console.log("🔄 === СИНХРОНИЗАЦИЯ ВСЕХ ИЗОБРАЖЕНИЙ ТОВАРОВ ===\n");

  // Создаем директорию если её нет
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Создана директория: ${IMAGES_DIR}\n`);
  }

  // Получаем все товары из БД
  const allProducts = db.select().from(products).all();
  console.log(`📊 Товаров в БД: ${allProducts.length}\n`);

  // Получаем все изображения со скрейпинга
  const donorImages = await scrapeAllProductImages();

  const stats: DownloadStats = {
    totalDownloaded: 0,
    totalUpdated: 0,
    totalFailed: 0,
  };

  // Обрабатываем каждый товар
  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    const donorProduct = donorImages[i];

    if (!donorProduct) {
      console.log(
        `⏭️  ${i + 1}/${allProducts.length} ${product.name} - нет данных на сайте`
      );
      continue;
    }

    console.log(`\n📦 ${i + 1}/${allProducts.length} ${product.name}`);
    console.log(`   Изображений на сайте: ${donorProduct.allImages.length}`);

    const localImagePaths: string[] = [];
    let mainImagePath = "";

    // Скачиваем все изображения
    for (let imgIdx = 0; imgIdx < donorProduct.allImages.length; imgIdx++) {
      const imageUrl = donorProduct.allImages[imgIdx];

      // Генерируем имя файла
      const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const filename =
        imgIdx === 0
          ? `product-${product.id}.${ext}`
          : `product-${product.id}-${imgIdx}.${ext}`;
      const filepath = path.join(IMAGES_DIR, filename);
      const localPath = `/images/products/${filename}`;

      process.stdout.write(
        `   ⏳ Изображение ${imgIdx + 1}/${donorProduct.allImages.length}...`
      );

      const success = await downloadImage(imageUrl, filepath);

      if (success) {
        console.log(" ✓");
        localImagePaths.push(localPath);
        if (imgIdx === 0) {
          mainImagePath = localPath;
        }
        stats.totalDownloaded++;
      } else {
        console.log(" ✗");
        stats.totalFailed++;
      }
    }

    // Обновляем БД если скачали хотя бы одно изображение
    if (localImagePaths.length > 0) {
      try {
        await db
          .update(products)
          .set({
            image: mainImagePath,
            images: JSON.stringify(localImagePaths),
          })
          .where(eq(products.id, product.id));

        console.log(
          `   ✅ Обновлено в БД (${localImagePaths.length} изображений)`
        );
        stats.totalUpdated++;
      } catch (error) {
        console.log(`   ❌ Ошибка обновления БД: ${error}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА!");
  console.log("=".repeat(50));
  console.log(`📥 Всего скачано изображений: ${stats.totalDownloaded}`);
  console.log(`🔄 Обновлено товаров в БД: ${stats.totalUpdated}`);
  console.log(`❌ Ошибок: ${stats.totalFailed}`);
  console.log(`📁 Изображения сохранены в: ${IMAGES_DIR}`);
  console.log("\n💡 Следующий шаг: npm run build");
}

main().catch((error: Error) => {
  console.error("❌ Критическая ошибка:", error.message);
  process.exit(1);
});
