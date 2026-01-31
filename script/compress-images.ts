import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "client/public/images/products");
const BACKUP_DIR = path.join(process.cwd(), "client/public/images/products-backup");

interface CompressionStats {
  totalFiles: number;
  successfullyCompressed: number;
  failed: number;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
}

async function compressImages(): Promise<void> {
  console.log("🖼️  === СЖАТИЕ ВСЕХ ИЗОБРАЖЕНИЙ ТОВАРОВ ===\n");

  // Проверяем наличие директории
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Директория не найдена: ${IMAGES_DIR}`);
    process.exit(1);
  }

  // Создаем резервную копию
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log("📦 Создаю резервную копию оригинальных изображений...");
    fs.cpSync(IMAGES_DIR, BACKUP_DIR, { recursive: true });
    console.log(`✓ Резервная копия создана: ${BACKUP_DIR}\n`);
  }

  // Получаем список всех JPG файлов
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  console.log(`📊 Найдено изображений: ${files.length}\n`);

  const stats: CompressionStats = {
    totalFiles: files.length,
    successfullyCompressed: 0,
    failed: 0,
    originalSize: 0,
    compressedSize: 0,
    savedBytes: 0,
    savedPercent: 0,
  };

  // Сжимаем каждое изображение
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filepath = path.join(IMAGES_DIR, file);
    const fileStats = fs.statSync(filepath);
    const originalSize = fileStats.size;

    process.stdout.write(
      `⏳ ${i + 1}/${files.length} ${file.padEnd(30)}... `
    );

    try {
      // Определяем формат
      const isJpeg = /\.(jpg|jpeg)$/i.test(file);

      if (isJpeg) {
        // Сжимаем JPEG с качеством 80
        await sharp(filepath)
          .jpeg({ quality: 80, progressive: true })
          .toFile(filepath + ".tmp");
      } else {
        // Сжимаем PNG с оптимизацией
        await sharp(filepath)
          .png({ compressionLevel: 9, progressive: true })
          .toFile(filepath + ".tmp");
      }

      // Заменяем оригинальный файл
      fs.renameSync(filepath + ".tmp", filepath);

      const newStats = fs.statSync(filepath);
      const compressedSize = newStats.size;
      const savedBytes = originalSize - compressedSize;
      const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

      stats.originalSize += originalSize;
      stats.compressedSize += compressedSize;
      stats.successfullyCompressed++;

      console.log(
        `✓ ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (-${savedPercent}%)`
      );
    } catch (error) {
      console.log(`✗ Ошибка: ${(error as Error).message}`);
      stats.failed++;
    }
  }

  // Итоговая статистика
  stats.savedBytes = stats.originalSize - stats.compressedSize;
  stats.savedPercent =
    ((stats.savedBytes / stats.originalSize) * 100).toFixed(1) as any;

  console.log("\n" + "=".repeat(60));
  console.log("✅ СЖАТИЕ ЗАВЕРШЕНО!");
  console.log("=".repeat(60));
  console.log(`📊 Всего файлов: ${stats.totalFiles}`);
  console.log(`✓ Успешно сжато: ${stats.successfullyCompressed}`);
  console.log(`✗ Ошибок: ${stats.failed}`);
  console.log(
    `\n💾 Исходный размер: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `📦 Сжатый размер: ${(stats.compressedSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `💰 Сэкономлено: ${(stats.savedBytes / 1024 / 1024).toFixed(2)} MB (${stats.savedPercent}%)`
  );
  console.log(`\n📁 Резервная копия: ${BACKUP_DIR}`);
  console.log("\n💡 Следующий шаг: npm run build && npm run deploy");
}

compressImages().catch((error: Error) => {
  console.error("❌ Критическая ошибка:", error.message);
  process.exit(1);
});
