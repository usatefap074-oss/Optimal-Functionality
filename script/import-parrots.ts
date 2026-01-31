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
  category: string;
  specs: { key: string; value: string }[];
}

async function importProducts() {
  try {
    const filepath = path.join(process.cwd(), "scraped-parrots.json");

    if (!fs.existsSync(filepath)) {
      console.error(`❌ Файл не найден: ${filepath}`);
      console.log("Сначала запустите: npm run scrape:parrots");
      process.exit(1);
    }

    const data = fs.readFileSync(filepath, "utf-8");
    const scrapedProducts: ScrapedProduct[] = JSON.parse(data);

    console.log(`📥 Импортирую ${scrapedProducts.length} товаров...`);

    let imported = 0;
    const slugCount: Record<string, number> = {};

    for (const scraped of scrapedProducts) {
      try {
        let baseSlug = generateSlug(scraped.name);
        
        // Handle duplicates by appending index
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
          description: scraped.description,
          specs: JSON.stringify(scraped.specs),
          popular: false,
        };

        await db.insert(products).values(product);
        imported++;
        console.log(`✓ ${imported}. ${scraped.name} - ${scraped.price} ₽ (slug: ${slug})`);
      } catch (error) {
        console.error(`✗ Ошибка при импорте "${scraped.name}":`, error);
      }
    }

    console.log("\n✅ Импорт завершён!");
    console.log(`📊 Импортировано: ${imported}`);

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

importProducts();
