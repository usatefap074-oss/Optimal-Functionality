import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { telegramService } from "./telegram";
import path from "path";
import fs from "fs";

const __dirname = path.resolve(process.cwd());

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === PAYMENT PAGE ===
  app.get("/payment.html", (req, res) => {
    const paymentPath = path.resolve(__dirname, "../client/public/payment.html");
    if (fs.existsSync(paymentPath)) {
      res.sendFile(paymentPath);
    } else {
      res.status(404).send("Payment page not found");
    }
  });

  // === HEALTH CHECK ===
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // === API ROUTES ===

  app.get(api.products.list.path, async (req, res) => {
    try {
        const query = api.products.list.input.optional().parse(req.query);
        const products = await storage.getProducts({
            inStock: query?.inStock === 'true',
            minPrice: query?.minPrice,
            maxPrice: query?.maxPrice,
            sort: query?.sort as any,
            search: query?.search,
        });
        res.json(products);
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "Invalid query parameters" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const product = await storage.getProduct(slug);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });
  
  app.get(api.products.getById.path, async (req, res) => {
    const product = await storage.getProductById(Number(req.params.id));
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(Number(req.params.id), req.body);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const result = await storage.createOrder(input);
      
      console.log('Order created:', result); // DEBUG
      
      // Send notification to Telegram
      const products = new Map();
      for (const item of input.items) {
        const product = await storage.getProductById(item.productId);
        if (product) {
          products.set(item.productId, product);
        }
      }
      
      const message = telegramService.formatOrderMessage(
        result.orderNumber,
        input,
        products,
        result.total
      );
      
      await telegramService.sendToBot(message);
      
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Handle other errors (like product not found)
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Telegram webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update = req.body;
      await telegramService.handleUpdate(update);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ ok: false });
    }
  });

  // === REVIEWS ===
  app.get(api.reviews.list.path, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Категории больше не нужны - только попугаи

  // Test Telegram notification
  app.get('/api/test-telegram', async (_req, res) => {
    const testMessage = `🛒 <b>Тестовая заявка #TEST-001</b>\n\n• Padovan GrandMix для попугаев x2 = 1700 ₽\n• Качели деревянные x1 = 350 ₽\n\n💰 2050 ₽\n🚚 Курьер\nМосква, ул. Примерная, 1, кв. 5\n💳 Карта онлайн\n\n📱 +7 (999) 123-45-67\n👤 Иван Петров\n📧 ivan@example.com\n💬 Доставить в выходной`;
    
    const success = await telegramService.sendToBot(testMessage);
    
    if (success) {
      res.json({ message: 'Test notification sent successfully!' });
    } else {
      res.status(500).json({ message: 'Failed to send test notification. Check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local' });
    }
  });

  // Get Telegram updates to find chat_id
  app.get('/api/telegram-setup', async (_req, res) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(400).json({ 
        error: 'TELEGRAM_BOT_TOKEN not configured',
        instructions: 'Add TELEGRAM_BOT_TOKEN to .env.local'
      });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
      const data = await response.json();
      
      if (!data.ok) {
        return res.status(400).json({ 
          error: 'Invalid bot token',
          details: data
        });
      }

      const updates = data.result;
      
      if (updates.length === 0) {
        return res.json({
          message: 'No messages found',
          instructions: [
            '1. Open Telegram',
            '2. Find your bot',
            '3. Send /start or any message to the bot',
            '4. Refresh this page'
          ]
        });
      }

      const chatIds = updates
        .map((update: any) => update.message?.chat?.id)
        .filter((id: any) => id)
        .filter((id: any, index: number, self: any[]) => self.indexOf(id) === index);

      return res.json({
        message: 'Chat IDs found!',
        chatIds,
        instructions: [
          `Add this to .env.local:`,
          `TELEGRAM_CHAT_ID=${chatIds[0]}`,
          '',
          'Then restart the server'
        ]
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to get updates',
        details: (error as Error).message
      });
    }
  });

  // === START TELEGRAM BOT POLLING ===
  telegramService.startPolling();

  return httpServer;
}
