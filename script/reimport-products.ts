import * as fs from "fs";
import * as path from "path";
import { db } from "../server/db";
import { products } from "@shared/schema";
import type { InsertProduct } from "@shared/schema";

interface ScrapedProduct {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specs: { key: string; value: string }[];
}

async function reimportProducts() {
  try {
    const filepath = path.join(process.cwd(), "scraped-parrots.json");

    if (!fs.existsSync(filepath)) {
      console.error(`❌ Файл не найден: ${filepath}`);
      process.exit(1);
    }

    const data = fs.readFileSync(filepath, "utf-8");
    const scrapedProducts: ScrapedProduct[] = JSON.parse(data);

    console.log(`🗑️  Очищаю старые товары...`);
    await db.delete(products);
    console.log(`✓ База очищена\n`);

    console.log(`📥 Импортирую ${scrapedProducts.length} товаров с реальными фото...\n`);

    let imported = 0;
    const slugCount: Record<string, number> = {};

    for (const scraped of scrapedProducts) {
      try {
        let baseSlug = generateSlug(scraped.name);
        
        if (slugCount[baseSlug] === undefined) {
          slugCount[baseSlug] = 0;
        } else {
          slugCount[baseSlug]++;
        }
        
        const slug = slugCount[baseSlug] > 0 
          ? `${baseSlug}-${slugCount[baseSlug]}` 
          : baseSlug;

        const product: InsertProduct = {
          slug,
          name: scraped.name,
          price: Math.round(scraped.price * 100), // В копейках
          oldPrice: scraped.originalPrice
            ? Math.round(scraped.originalPrice * 100)
            : undefined,
          inStock: true,
          image: scraped.image,
          images: JSON.stringify([scraped.image]),
          description: scraped.description || "Ручной выкормыш, полностью социализирован",
          specs: JSON.stringify(scraped.specs),
          popular: false,
        };

        await db.insert(products).values(product);
        imported++;
        console.log(`✓ ${imported}. ${scraped.name}`);
        console.log(`  Фото: ${scraped.image}`);
        console.log(`  Цена: ${scraped.price} ₽\n`);
      } catch (error) {
        console.error(`✗ Ошибка при импорте "${scraped.name}":`, error);
      }
    }

    console.log("\n✅ Реимпорт завершён!");
    console.log(`📊 Импортировано: ${imported} товаров с реальными фотографиями`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^а-яa-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

reimportProducts();
