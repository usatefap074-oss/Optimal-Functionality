import { chromium } from "playwright";

async function takeScreenshot() {
  console.log("🌐 Открываю браузер...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Слушаем все console.log из браузера
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`🖥️ [${type}] ${text}`);
  });
  
  // Слушаем ошибки
  page.on('pageerror', error => {
    console.error(`❌ Page Error: ${error.message}`);
  });
  
  try {
    console.log("📄 Загружаю http://localhost:5000/catalog...");
    await page.goto("http://localhost:5000/catalog", { waitUntil: "networkidle" });
    
    console.log("⏳ Жду 5 секунд...");
    await page.waitForTimeout(5000);
    
    console.log("📸 Делаю скриншот...");
    await page.screenshot({ path: "catalog-screenshot.png", fullPage: true });
    
    console.log("✅ Скриншот сохранён: catalog-screenshot.png");
    
    // Проверяю, есть ли товары на странице
    const productCards = await page.locator('[class*="ProductCard"], .grid > div').count();
    console.log(`📊 Найдено элементов в сетке: ${productCards}`);
    
    // Проверяю текст на странице
    const pageText = await page.textContent('body');
    if (pageText?.includes('Товары не найдены')) {
      console.log("❌ На странице текст 'Товары не найдены'");
    }
    if (pageText?.includes('товаров найдено')) {
      const match = pageText.match(/(\d+) товаров найдено/);
      if (match) {
        console.log(`📊 Счётчик показывает: ${match[1]} товаров`);
      }
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error("❌ Ошибка:", error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
