# ⚡ QUICK REFERENCE - Быстрая справка

## 🗂️ Где что находится?

| Что | Где |
|-----|-----|
| Главная страница | `client/src/pages/Home.tsx` |
| Каталог товаров | `client/src/pages/Catalog.tsx` |
| Страница товара | `client/src/pages/ProductDetails.tsx` |
| Корзина | `client/src/pages/Cart.tsx` |
| Оформление заказа | `client/src/pages/Checkout.tsx` |
| Доставка | `client/src/pages/Delivery.tsx` |
| Контакты | `client/src/pages/Contacts.tsx` |
| Админ-панель | `client/src/pages/Admin.tsx` |
| Шапка/навигация | `client/src/components/Layout.tsx` |
| Карточка товара | `client/src/components/ProductCard.tsx` |
| Отзывы | `client/src/components/ReviewsCarousel.tsx` |
| UI компоненты | `client/src/components/ui/` |
| Hooks | `client/src/hooks/` |
| API endpoints | `server/routes.ts` |
| Работа с БД | `server/storage.ts` |
| Telegram бот | `server/telegram.ts` |
| Типы и схемы | `shared/schema.ts` |
| API контракт | `shared/routes.ts` |
| Конфиг Tailwind | `tailwind.config.ts` |
| Конфиг Vite | `vite.config.ts` |
| Конфиг TypeScript | `tsconfig.json` |
| Зависимости | `package.json` |

---

## 🚀 Команды

```bash
npm run dev              # Запуск dev сервера
npm run build           # Сборка для production
npm start               # Запуск production
npm run check           # TypeScript проверка
npm run db:push         # Миграция БД
npm run db:seed-reviews # Добавить отзывы
```

---

## 📁 Структура папок

```
client/src/
├── components/          # React компоненты
│   ├── Layout.tsx       # Шапка и навигация
│   ├── ProductCard.tsx  # Карточка товара
│   ├── ReviewsCarousel.tsx
│   └── ui/              # shadcn/ui компоненты
├── pages/               # Страницы приложения
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductDetails.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Delivery.tsx
│   ├── Contacts.tsx
│   └── Admin.tsx
├── hooks/               # React hooks
│   ├── use-products.ts
│   ├── use-cart.ts
│   ├── use-orders.ts
│   ├── use-reviews.ts
│   └── ...
├── lib/                 # Утилиты
│   ├── queryClient.ts
│   └── utils.ts
├── App.tsx              # Маршрутизация
├── main.tsx             # Entry point
└── index.css            # Глобальные стили

server/
├── index.ts             # Инициализация сервера
├── routes.ts            # API endpoints
├── storage.ts           # Работа с БД
├── db.ts                # SQLite подключение
├── telegram.ts          # Telegram бот
├── static.ts            # Раздача статики
└── vite.ts              # Vite dev server

shared/
├── schema.ts            # Drizzle таблицы + Zod схемы
└── routes.ts            # API контракт

data/
└── parrot_shop.db       # SQLite база данных
```

---

## 🔗 API Endpoints

```
GET  /api/products                  # Список товаров
GET  /api/products/:slug            # Товар по slug
GET  /api/products/id/:id           # Товар по ID
POST /api/products                  # Создать товар (admin)
PUT  /api/products/:id              # Обновить товар (admin)
DELETE /api/products/:id            # Удалить товар (admin)

POST /api/orders                    # Создать заказ
GET  /api/reviews                   # Список отзывов
POST /api/reviews                   # Создать отзыв

GET  /api/test-telegram             # Тест Telegram
GET  /api/telegram-setup            # Получить Chat ID
POST /api/telegram/webhook          # Webhook Telegram
```

---

## 🗄️ Таблицы БД

### products
```
id, slug, name, price, oldPrice, inStock, image, images, 
description, specs, popular, createdAt
```

### orders
```
id, orderNumber, customerName, customerPhone, customerEmail,
deliveryMethod, city, address, apartment, comment,
paymentMethod, total, status, telegramOrderId, telegramConfirmed, createdAt
```

### orderItems
```
id, orderId, productId, quantity, price
```

### reviews
```
id, customerName, city, rating, text, image, deliveryMethod, createdAt
```

---

## 🎨 Tailwind классы (часто используемые)

```
Размеры:        w-full, h-12, p-4, m-2, gap-4
Цвета:          bg-primary, text-white, border-primary
Адаптивность:   md:text-base, lg:grid-cols-4
Flexbox:        flex, items-center, justify-between
Grid:           grid, grid-cols-2, md:grid-cols-3
Скругление:     rounded-lg, md:rounded-2xl
Тени:           shadow-md, hover:shadow-xl
Анимация:       animate-pulse, transition-all
Состояния:      hover:, active:, disabled:, focus:
```

---

## 📝 Типы данных

```typescript
// Товар
type Product = {
  id: number
  slug: string
  name: string
  price: number
  oldPrice?: number
  inStock: boolean
  image: string
  images: string[]
  description: string
  specs: {key: string, value: string}[]
  popular: boolean
  createdAt: Date
}

// Заказ
type Order = {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryMethod: 'pickup' | 'courier' | 'cdek' | 'post'
  city?: string
  address?: string
  apartment?: string
  comment?: string
  paymentMethod: 'cash' | 'card_online' | 'sbp'
  total: number
  status: 'new' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  telegramOrderId: string
  telegramConfirmed: boolean
  createdAt: Date
}

// Отзыв
type Review = {
  id: number
  customerName: string
  city: string
  rating: number
  text: string
  image: string
  deliveryMethod: string
  createdAt: Date
}
```

---

## 🔧 Переменные окружения

```env
DATABASE_PATH=./data/parrot_shop.db
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=your_username
TELEGRAM_CHAT_ID=your_chat_id
```

---

## 💡 Частые операции

### Получить товары
```typescript
const { data: products } = useProducts({ sort: 'popular' });
```

### Добавить в корзину
```typescript
const { addItem } = useCart();
addItem(product, quantity);
```

### Создать заказ
```typescript
const createOrder = useCreateOrder();
createOrder.mutate(orderData);
```

### Отправить в Telegram
```typescript
await telegramService.sendToBot("Сообщение", chatId);
```

### Валидировать данные
```typescript
const schema = z.object({ name: z.string().min(1) });
const data = schema.parse(input);
```

---

## 🐛 Отладка

```bash
# Проверить типы
npm run check

# Посмотреть логи
tail -f logs/app.log

# Тестировать API
curl http://localhost:5000/api/products

# Очистить БД
rm data/parrot_shop.db
npm run db:push
```

---

## 📱 Адаптивные точки (Tailwind)

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

Использование: md:text-base, lg:grid-cols-4
```

---

## 🎯 Маршруты приложения

```
/                   # Главная
/catalog            # Каталог
/product/:slug      # Страница товара
/cart               # Корзина
/checkout           # Оформление
/delivery           # Доставка
/contacts           # Контакты
/admin              # Админ-панель
```

---

## 🔐 Безопасность

- ✅ Валидация Zod
- ✅ TypeScript типизация
- ✅ Переменные окружения
- ✅ HTTPS для Telegram
- ✅ SQL injection protection (ORM)
- ✅ XSS protection (React)

---

## 📚 Документация

- `PROJECT_CONTEXT.md` - Полная документация
- `README.md` - Основная информация
- `DEPLOY.md` - Деплой на Coolify
- `TELEGRAM_SETUP.md` - Настройка Telegram
- `MOBILE_OPTIMIZATION.md` - Мобильная оптимизация

---

## ⚙️ Конфигурация

| Файл | Назначение |
|------|-----------|
| `vite.config.ts` | Конфиг Vite (сборка, алиасы) |
| `tsconfig.json` | TypeScript конфиг |
| `tailwind.config.ts` | Tailwind CSS конфиг |
| `drizzle.config.ts` | Drizzle ORM конфиг |
| `components.json` | shadcn/ui конфиг |
| `package.json` | Зависимости и скрипты |
| `.env.example` | Пример переменных окружения |

---

## 🚀 Деплой

```bash
# Сборка
npm run build

# Локально
npm start

# Docker
docker build -t parrot-shop .
docker run -p 5000:5000 parrot-shop

# Docker Compose
docker-compose up
```

---

**Используйте эту справку для быстрого поиска информации!**
