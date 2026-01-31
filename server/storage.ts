import { db } from "./db";
import {
  products,
  orders,
  orderItems,
  reviews,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type InsertOrderItem,
  type Review,
  type InsertReview,
  type CreateOrderRequest,
  type ProductQueryParams
} from "@shared/schema";
import { eq, like, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(params?: ProductQueryParams): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  
  // Orders
  createOrder(order: CreateOrderRequest): Promise<{ orderNumber: string, total: number, telegramOrderId: string }>;
  confirmOrderByTelegramId(telegramOrderId: string): Promise<Order | undefined>;
  getOrderByTelegramId(telegramOrderId: string): Promise<Order | undefined>;

  // Reviews
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const conditions = [];
    
    if (params?.inStock) {
      conditions.push(eq(products.inStock, true));
    }
    
    if (params?.minPrice) {
      conditions.push(gte(products.price, params.minPrice));
    }
    
    if (params?.maxPrice) {
      conditions.push(lte(products.price, params.maxPrice));
    }

    if (params?.search) {
      conditions.push(like(products.name, `%${params.search}%`));
    }

    let query = db.select().from(products);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price_asc':
          query = query.orderBy(asc(products.price)) as any;
          break;
        case 'price_desc':
          query = query.orderBy(desc(products.price)) as any;
          break;
        case 'name':
          query = query.orderBy(asc(products.name)) as any;
          break;
        case 'popular':
          query = query.orderBy(desc(products.popular)) as any;
          break;
        default:
          query = query.orderBy(desc(products.createdAt)) as any;
      }
    } else {
        // Default sort
        query = query.orderBy(desc(products.createdAt)) as any;
    }

    const results = await query;
    return results.map(p => this.deserializeProduct(p));
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    if (product) {
      return this.deserializeProduct(product);
    }
    return undefined;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (product) {
      return this.deserializeProduct(product);
    }
    return undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const serialized = this.serializeProduct(product);
    const [newProduct] = await db.insert(products).values(serialized).returning();
    return this.deserializeProduct(newProduct);
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const serialized = this.serializeProduct(product);
    const [updated] = await db.update(products)
      .set(serialized)
      .where(eq(products.id, id))
      .returning();
    return updated ? this.deserializeProduct(updated) : undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  private serializeProduct(product: any): any {
    return {
      ...product,
      images: Array.isArray(product.images) ? JSON.stringify(product.images) : product.images,
      specs: Array.isArray(product.specs) ? JSON.stringify(product.specs) : product.specs,
    };
  }

  private deserializeProduct(product: any): Product {
    return {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs,
    };
  }

  async createOrder(req: CreateOrderRequest): Promise<{ orderNumber: string, total: number, telegramOrderId: string }> {
    // 1. Calculate total and verify items
    let total = 0;
    const itemsToInsert: { productId: number, quantity: number, price: number }[] = [];

    for (const item of req.items) {
      const product = await this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const price = product.price;
      total += price * item.quantity;
      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price
      });
    }

    // Delivery cost logic (simple)
    // "Доставка: бесплатно / X ₽ (если заказ < 3000 ₽)" - logic handled in frontend or here?
    // Let's implement basics: Courier 300 RUB.
    let deliveryCost = 0;
    if (req.deliveryMethod === 'courier') {
       deliveryCost = 300;
    }
    // If order >= 3000 and method is courier, maybe free? 
    // The prompt says "Доставка: бесплатно / X ₽ (если заказ < 3000 ₽)". 
    // Let's assume free shipping > 3000 for courier.
    if (req.deliveryMethod === 'courier' && total >= 3000) {
        deliveryCost = 0;
    }

    const finalTotal = total + deliveryCost;

    // 2. Create Order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const telegramOrderId = randomUUID();
    
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerEmail: req.customerEmail,
      deliveryMethod: req.deliveryMethod,
      city: req.city,
      address: req.address,
      apartment: req.apartment,
      comment: req.comment,
      paymentMethod: req.paymentMethod,
      total: finalTotal,
      status: 'new',
      telegramOrderId,
      telegramConfirmed: false
    }).returning();

    // 3. Create Order Items
    for (const item of itemsToInsert) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
    }

    return { orderNumber, total: finalTotal, telegramOrderId };
  }

  async confirmOrderByTelegramId(telegramOrderId: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ telegramConfirmed: true, status: 'confirmed' })
      .where(eq(orders.telegramOrderId, telegramOrderId))
      .returning();
    return order;
  }

  async getOrderByTelegramId(telegramOrderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.telegramOrderId, telegramOrderId));
    return order;
  }

  async getReviews(): Promise<Review[]> {
    const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return result;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
}

export const storage = new DatabaseStorage();
