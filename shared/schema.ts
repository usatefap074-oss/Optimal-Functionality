import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'feed', 'cages', 'toys', 'vet'
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  inStock: boolean("in_stock").default(true).notNull(),
  image: text("image").notNull(),
  images: text("images").array().notNull(),
  description: text("description").notNull(),
  specs: jsonb("specs").$type<{key: string, value: string}[]>().notNull(),
  popular: boolean("popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // Human readable ID
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  
  deliveryMethod: text("delivery_method").notNull(), // 'pickup', 'courier', 'cdek', 'post'
  city: text("city"),
  address: text("address"),
  apartment: text("apartment"),
  comment: text("comment"),
  
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card_online', 'sbp'
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"), // 'new', 'processing', 'completed', 'cancelled'
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price at moment of purchase
});

// === SCHEMAS ===

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderNumber: true, status: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// === EXPLICIT API TYPES ===

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

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
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'name';
  search?: string;
}
