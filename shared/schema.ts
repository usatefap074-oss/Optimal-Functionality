import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  inStock: integer("in_stock", { mode: 'boolean' }).default(true).notNull(),
  image: text("image").notNull(),
  images: text("images").notNull(), // JSON array as string
  description: text("description").notNull(),
  specs: text("specs").notNull(), // JSON as string
  popular: integer("popular", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  
  deliveryMethod: text("delivery_method").notNull(),
  city: text("city"),
  address: text("address"),
  apartment: text("apartment"),
  comment: text("comment"),
  
  paymentMethod: text("payment_method").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"), // new, confirmed, processing, completed, cancelled
  
  telegramOrderId: text("telegram_order_id").unique(), // Unique ID for Telegram confirmation
  telegramConfirmed: integer("telegram_confirmed", { mode: 'boolean' }).default(false),
  
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  city: text("city").notNull(),
  rating: integer("rating").notNull(), // 1-5
  text: text("text").notNull(),
  image: text("image").notNull(), // URL to customer's parrot photo
  deliveryMethod: text("delivery_method").notNull(), // e.g., "Доставка по России", "Самовывоз"
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// === SCHEMAS ===

// Custom schema for inserting products - accepts arrays which will be serialized
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }).extend({
  images: z.union([z.string(), z.array(z.string())]),
  specs: z.union([z.string(), z.array(z.object({ key: z.string(), value: z.string() }))]),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderNumber: true, status: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===

export type Product = Omit<typeof products.$inferSelect, 'images' | 'specs'> & {
  images: string[];
  specs: { key: string; value: string }[];
};

export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Request Types
export type CreateOrderRequest = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: string;
  city?: string;
  address?: string;
  apartment?: string;
  comment?: string;
  paymentMethod: string;
  items: {
    productId: number;
    quantity: number;
  }[];
};

// Response Types
export type ProductResponse = Product;
export type OrderResponse = Order & { items: (OrderItem & { product?: Product })[] };

// Query Params
export interface ProductQueryParams {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'name';
  search?: string;
}
