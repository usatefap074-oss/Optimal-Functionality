import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

interface Product {
  name: string;
  image: string;
}

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

function generateFilename(url: string, index: number): string {
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  return `product-${index}.${ext}`;
}

async function main() {
  console.log("📥 Загружаю фотки товаров...");

  // Создаем директорию если её нет
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Создана директория: ${IMAGES_DIR}`);
  }

  // Читаем JSON с товарами
  const jsonPath = path.join(process.cwd(), "scraped-parrots.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ Файл scraped-parrots.json не найден");
    process.exit(1);
  }

  const data = fs.readFileSync(jsonPath, "utf-8");
  const products: Product[] = JSON.parse(data);

  console.log(`📊 Всего товаров: ${products.length}`);

  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product.image) {
      console.log(`⏭️  ${i + 1}. ${product.name} - нет изображения`);
      continue;
    }

    const filename = generateFilename(product.image, i + 1);
    const filepath = path.join(IMAGES_DIR, filename);

    process.stdout.write(
      `⏳ ${i + 1}/${products.length}. Загружаю ${product.name}...`
    );

    const success = await downloadImage(product.image, filepath);

    if (success) {
      console.log(" ✓");
      downloaded++;
    } else {
      console.log(" ✗");
      failed++;
    }
  }

  console.log("\n✅ Загрузка завершена!");
  console.log(`📊 Загружено: ${downloaded}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📁 Фотки в: ${IMAGES_DIR}`);
}

main().catch(console.error);
