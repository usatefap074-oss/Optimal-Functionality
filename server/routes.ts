import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === API ROUTES ===

  app.get(api.products.list.path, async (req, res) => {
    try {
        const query = api.products.list.input.optional().parse(req.query);
        const products = await storage.getProducts({
            category: query?.category,
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
    const product = await storage.getProduct(req.params.slug);
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

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const result = await storage.createOrder(input);
      
      // TODO: Send webhook to Telegram here
      // if (process.env.TELEGRAM_WEBHOOK_URL) { ... }
      
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

  app.get(api.categories.list.path, (_req, res) => {
    const categories = [
        { id: 'feed', name: 'Корма' },
        { id: 'cages', name: 'Клетки' },
        { id: 'toys', name: 'Игрушки' },
        { id: 'vet', name: 'Ветаптека' },
    ];
    res.json(categories);
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    console.log("Seeding database with initial products...");
    
    const initialProducts = [
        // КОРМА
        {
            name: "Padovan GrandMix для попугаев",
            category: "feed",
            price: 850,
            image: "https://images.unsplash.com/photo-1620698116935-4333678385da?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1620698116935-4333678385da?w=500&q=80"],
            description: "Комплексный корм для средних попугаев (неразлучников, корелл). Содержит витамины и злаки.",
            specs: [{key: "Вес", value: "400г"}, {key: "Бренд", value: "Padovan"}],
            popular: true
        },
        {
            name: "Versele-Laga Prestige Premium",
            category: "feed",
            price: 1200,
            image: "https://images.unsplash.com/photo-1615822461937-299f06e00cb1?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1615822461937-299f06e00cb1?w=500&q=80"],
            description: "Премиальная смесь для всех видов попугаев. Обогащена VAM-гранулами.",
            specs: [{key: "Вес", value: "1кг"}, {key: "Бренд", value: "Versele-Laga"}],
            popular: true
        },
        {
            name: "JR Farm Classic для больших попугаев",
            category: "feed",
            price: 1500,
            image: "https://images.unsplash.com/photo-1608611100251-5079a49931b7?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1608611100251-5079a49931b7?w=500&q=80"],
            description: "Сбалансированный основной корм с большим количеством фруктов.",
            specs: [{key: "Вес", value: "950г"}, {key: "Бренд", value: "JR Farm"}],
            popular: false
        },
        {
            name: "RIO для средних попугаев",
            category: "feed",
            price: 450,
            image: "https://images.unsplash.com/photo-1549488344-c7052fb50142?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1549488344-c7052fb50142?w=500&q=80"],
            description: "Рацион для ежедневного кормления. Содержит нут, сафлор и рябину.",
            specs: [{key: "Вес", value: "500г"}, {key: "Бренд", value: "RIO"}],
            popular: true
        },
        {
            name: "Fiory African для Жако",
            category: "feed",
            price: 2100,
            image: "https://images.unsplash.com/photo-1589304677732-c7a40b0373df?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1589304677732-c7a40b0373df?w=500&q=80"],
            description: "Специальная смесь для африканских попугаев.",
            specs: [{key: "Вес", value: "800г"}, {key: "Бренд", value: "Fiory"}],
            popular: false
        },
        {
            name: "Witte Molen Premium для крупных попугаев",
            category: "feed",
            price: 1800,
            image: "https://images.unsplash.com/photo-1596752763456-13d83395669b?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1596752763456-13d83395669b?w=500&q=80"],
            description: "Корм с орехами и тропическими фруктами.",
            specs: [{key: "Вес", value: "1кг"}, {key: "Бренд", value: "Witte Molen"}],
            popular: false
        },

        // КЛЕТКИ
        {
            name: "Клетка Triol BC14W для средних птиц",
            category: "cages",
            price: 8500,
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80"],
            description: "Просторная клетка с открывающимся верхом. Подходит для корелл.",
            specs: [{key: "Размер", value: "82x77x156 см"}, {key: "Цвет", value: "Белый"}],
            popular: true
        },
        {
            name: "Ferplast Pianola для попугаев",
            category: "cages",
            price: 12000,
            image: "https://images.unsplash.com/photo-1544426549-012906b864ba?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1544426549-012906b864ba?w=500&q=80"],
            description: "Элегантная клетка с золотистыми прутьями.",
            specs: [{key: "Бренд", value: "Ferplast"}, {key: "Материал", value: "Металл/Пластик"}],
            popular: false
        },
        {
            name: "Savic Camille 50 для крупных птиц",
            category: "cages",
            price: 18500,
            image: "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=500&q=80"],
            description: "Вольер для крупных попугаев с защитой от мусора.",
            specs: [{key: "Бренд", value: "Savic"}, {key: "Тип", value: "Вольер"}],
            popular: false
        },
        {
            name: "Imac Elisa для маленьких попугаев",
            category: "cages",
            price: 6500,
            image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=500&q=80"],
            description: "Уютная клетка для волнистых попугаев.",
            specs: [{key: "Бренд", value: "Imac"}, {key: "Форма", value: "Прямоугольная"}],
            popular: true
        },
        {
            name: "Voltrega 001 для корелл",
            category: "cages",
            price: 9800,
            image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1444464666168-49d633b86797?w=500&q=80"],
            description: "Качественная испанская клетка.",
            specs: [{key: "Бренд", value: "Voltrega"}, {key: "Страна", value: "Испания"}],
            popular: false
        },

        // ИГРУШКИ
        {
            name: "Канат хлопковый с узлами",
            category: "toys",
            price: 450,
            image: "https://images.unsplash.com/photo-1551846017-d5d59f77f98d?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1551846017-d5d59f77f98d?w=500&q=80"],
            description: "Гибкий канат для лазания.",
            specs: [{key: "Материал", value: "Хлопок"}, {key: "Длина", value: "50 см"}],
            popular: true
        },
        {
            name: "Качели деревянные",
            category: "toys",
            price: 350,
            image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=500&q=80"],
            description: "Натуральное дерево, безопасно для птиц.",
            specs: [{key: "Материал", value: "Дерево"}],
            popular: false
        },
        {
            name: "Лесенка из натурального дерева",
            category: "toys",
            price: 280,
            image: "https://images.unsplash.com/photo-1627483297886-ca08197c36a8?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1627483297886-ca08197c36a8?w=500&q=80"],
            description: "5 ступенек, крепление крючками.",
            specs: [{key: "Размер", value: "25 см"}],
            popular: true
        },
        {
            name: "Мяч плетёный с колокольчиком",
            category: "toys",
            price: 320,
            image: "https://images.unsplash.com/photo-1596739999059-4d6d3968600d?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1596739999059-4d6d3968600d?w=500&q=80"],
            description: "Игрушка-погрызушка из лозы.",
            specs: [{key: "Диаметр", value: "8 см"}],
            popular: false
        },
        {
            name: "Кормушка-головоломка",
            category: "toys",
            price: 890,
            image: "https://images.unsplash.com/photo-1618609571871-247514a681c2?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1618609571871-247514a681c2?w=500&q=80"],
            description: "Развивает интеллект птицы, заставляет добывать еду.",
            specs: [{key: "Материал", value: "Акрил"}],
            popular: true
        },

        // ВЕТАПТЕКА
        {
            name: "Витамины Beaphar Vinka",
            category: "vet",
            price: 650,
            image: "https://images.unsplash.com/photo-1471193945509-9adadd0974ce?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1471193945509-9adadd0974ce?w=500&q=80"],
            description: "Мультивитаминный комплекс для иммунитета.",
            specs: [{key: "Объем", value: "50 мл"}, {key: "Бренд", value: "Beaphar"}],
            popular: true
        },
        {
            name: "Минеральный камень с йодом",
            category: "vet",
            price: 120,
            image: "https://images.unsplash.com/photo-1628148855675-9e6610058e5f?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1628148855675-9e6610058e5f?w=500&q=80"],
            description: "Источник кальция и йода.",
            specs: [{key: "Вес", value: "20г"}],
            popular: false
        },
        {
            name: "Капли от клещей Чистотел",
            category: "vet",
            price: 380,
            image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80"],
            description: "Для обработки птиц от паразитов.",
            specs: [{key: "Объем", value: "10 мл"}],
            popular: false
        },
        {
            name: "Пробиотик для птиц Ветом",
            category: "vet",
            price: 520,
            image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
            images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80"],
            description: "Для нормализации пищеварения.",
            specs: [{key: "Вес", value: "50г"}],
            popular: true
        }
    ];

    for (const prod of initialProducts) {
        // Generate slug from name
        const slug = prod.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            + '-' + Math.floor(Math.random() * 1000);

        await storage.createProduct(insertProductSchema.parse({
            ...prod,
            slug,
            inStock: true,
            oldPrice: null
        }));
    }
    
    console.log(`Seeded ${initialProducts.length} products.`);
  }
}
