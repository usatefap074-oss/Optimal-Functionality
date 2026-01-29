import { z } from 'zod';
import { insertProductSchema, products, orders, insertOrderSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        category: z.string().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        inStock: z.enum(['true', 'false']).optional(),
        sort: z.enum(['popular', 'price_asc', 'price_desc', 'name']).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:slug',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getById: {
      method: 'GET' as const,
      path: '/api/products/id/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        customerName: z.string().min(1, "Name is required"),
        customerPhone: z.string().min(1, "Phone is required"),
        customerEmail: z.string().email().optional().or(z.literal('')),
        deliveryMethod: z.enum(['pickup', 'courier', 'cdek', 'post']),
        city: z.string().optional(),
        address: z.string().optional(),
        apartment: z.string().optional(),
        comment: z.string().optional(),
        paymentMethod: z.enum(['cash', 'card_online', 'sbp']),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })).min(1, "Cart is empty"),
      }),
      responses: {
        201: z.object({
          orderNumber: z.string(),
          total: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
        })),
      },
    },
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPES
// ============================================
export type CreateOrderInput = z.infer<typeof api.orders.create.input>;
