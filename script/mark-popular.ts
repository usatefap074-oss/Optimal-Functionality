import { db } from "../server/db";
import { products } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

async function markPopular() {
  try {
    // Mark first 8 products as popular
    const popularIds = [1, 2, 3, 4, 5, 6, 7, 8];
    
    await db.update(products)
      .set({ popular: true })
      .where(inArray(products.id, popularIds));
    
    console.log(`✓ Marked ${popularIds.length} products as popular`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

markPopular();
