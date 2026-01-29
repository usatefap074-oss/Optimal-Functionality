import { db } from "./db";
import {
  products,
  orders,
  orderItems,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type InsertOrderItem,
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
  
  // Orders
  createOrder(order: CreateOrderRequest): Promise<{ orderNumber: string, total: number }>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const conditions = [];
    
    if (params?.category) {
      conditions.push(eq(products.category, params.category));
    }
    
    if (params?.inStock) {
      // Handle boolean conversion if coming from query string
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

    return await query;
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async createOrder(req: CreateOrderRequest): Promise<{ orderNumber: string, total: number }> {
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
      status: 'new'
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

    return { orderNumber, total: finalTotal };
  }
}

export const storage = new DatabaseStorage();
