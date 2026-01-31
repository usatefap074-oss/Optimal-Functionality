import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import { db } from "./server/db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

const IMAGES_DIR = path.join(process.cwd(), "client/public/images/products");

async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filename);

    protocol
      .get(url, (response) => {
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
      })
      .on("error", () => {
        file.close();
        fs.unlink(filename, () => {});
        resolve(false);
      });
  });
}

async function main() {
  console.log("🔧 Исправляю изображения для продакшена...\n");

  // Создаем директорию если её нет
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Создана директория: ${IMAGES_DIR}\n`);
  }

  // Получаем все товары из базы
  const allProducts = db.select().from(products).all();
  console.log(`📊 Найдено товаров: ${allProducts.length}\n`);

  let downloaded = 0;
  let updated = 0;
  let failed = 0;

  for (const product of allProducts) {
    const imageUrl = product.image;
    
    // Пропускаем если уже локальный путь
    if (imageUrl.startsWith("/images/")) {
      console.log(`⏭️  ${product.name} - уже локальный путь`);
      continue;
    }

    // Генерируем имя файла
    const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
    const filename = `product-${product.id}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    const localPath = `/images/products/${filename}`;

    process.stdout.write(`⏳ ${product.name}...`);

    // Скачиваем изображение
    const success = await downloadImage(imageUrl, filepath);

    if (success) {
      // Обновляем путь в базе данных
      try {
        await db
          .update(products)
          .set({
            image: localPath,
            images: JSON.stringify([localPath]),
          })
          .where(eq(products.id, product.id));

        console.log(" ✓");
        downloaded++;
        updated++;
      } catch (error) {
        console.log(" ✗ (ошибка обновления БД)");
        failed++;
      }
    } else {
      console.log(" ✗ (ошибка загрузки)");
      failed++;
    }
  }

  console.log("\n✅ Готово!");
  console.log(`📥 Загружено изображений: ${downloaded}`);
  console.log(`🔄 Обновлено записей в БД: ${updated}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📁 Изображения в: ${IMAGES_DIR}`);
  console.log("\n💡 Теперь запустите: npm run build");
}

main().catch(console.error);
