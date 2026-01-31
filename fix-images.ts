import { db } from "./server/db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixImages() {
  console.log("🔧 Исправляю пустые изображения...");
  
  const allProducts = await db.select().from(products);
  
  let fixed = 0;
  for (const product of allProducts) {
    if (!product.image || product.image.trim() === "") {
      await db.update(products)
        .set({ 
          image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
          images: JSON.stringify(["https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80"])
        })
        .where(eq(products.id, product.id));
      fixed++;
      console.log(`✓ ${fixed}. ${product.name}`);
    }
  }
  
  console.log(`\n✅ Исправлено: ${fixed} товаров`);
  process.exit(0);
}

fixImages().catch(console.error);
