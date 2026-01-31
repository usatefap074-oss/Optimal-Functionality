import { db } from "./db";
import { products } from "../shared/schema";

// Временный endpoint для исправления изображений
export async function fixImagesHandler(req: any, res: any) {
  try {
    const stmt = db.prepare(`
      UPDATE products
      SET image = '/images/products/product-' || id || '.jpg',
          images = '["' || '/images/products/product-' || id || '.jpg' || '"]'
      WHERE image LIKE 'http%'
    `);

    const result = stmt.run();

    res.json({
      success: true,
      updated: result.changes,
      message: `Updated ${result.changes} products`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
