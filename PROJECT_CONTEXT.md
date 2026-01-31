# 🦜 PROJECT CONTEXT - Магазин товаров для попугаев

**Версия:** 1.0  
**Дата обновления:** 31.01.2026  
**Язык проекта:** TypeScript + React  
**Язык интерфейса:** Русский

---

## 📋 БЫСТРАЯ СПРАВКА

### Что это?
Полнофункциональный e-commerce магазин для продажи товаров для попугаев. Включает каталог, корзину, оформление заказов, интеграцию с Telegram-ботом для подтверждения заказов и систему отзывов.

### Основные технологии
- **Frontend:** React 18 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Backend:** Node.js + Express 5 + SQLite + Drizzle ORM
- **Интеграции:** Telegram Bot API, Zod validation
- **Деплой:** Docker, Docker Compose, Coolify-ready

### Структура проекта
```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI компоненты (shadcn/ui)
│   │   ├── pages/       # 8 страниц приложения
│   │   ├── hooks/       # React hooks для логики
│   │   └── lib/         # Утилиты и конфиги
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database queries
│   ├── db.ts            # SQLite connection
│   └── telegram.ts      # Telegram notifications
├── shared/              # Общие типы и схемы
│   ├── schema.ts        # Drizzle tables + Zod schemas
│   └── routes.ts        # API contract definitions
├── data/                # SQLite database
└── script/              # Утилиты для разработки
```

---

## 🗄️ БАЗА ДАННЫХ

### Таблицы (SQLite)

#### 1. **products** - Товары
```typescript
id: number (PK)
slug: string (UNIQUE) - URL-friendly название
name: string - Название товара
price: number - Цена в рублях
oldPrice?: number - Старая цена (для скидок)
inStock: boolean - В наличии?
image: string - Основное изображение (URL)
images: string[] - JSON массив доп. изображений
description: string - Описание товара
specs: object[] - Характеристики [{key, value}]
popular: boolean - Популярный товар?
createdAt: timestamp
```

#### 2. **orders** - Заказы
```typescript
id: number (PK)
orderNumber: string (UNIQUE) - Номер заказа (ORD-XXXXXX-XXX)
customerName: string - ФИО клиента
customerPhone: string - Телефон
customerEmail?: string - Email
deliveryMethod: enum - pickup|courier|cdek|post
city?: string - Город доставки
address?: string - Адрес доставки
apartment?: string - Квартира/офис
comment?: string - Комментарий к заказу
paymentMethod: enum - cash|card_online|sbp
total: number - Итоговая сумма (с доставкой)
status: enum - new|confirmed|processing|completed|cancelled
telegramOrderId: string (UNIQUE) - UUID для Telegram
telegramConfirmed: boolean - Подтвержден в боте?
createdAt: timestamp
```

#### 3. **orderItems** - Товары в заказе
```typescript
id: number (PK)
orderId: number (FK) - Ссылка на заказ
productId: number (FK) - Ссылка на товар
quantity: number - Количество
price: number - Цена товара на момент заказа
```

#### 4. **reviews** - Отзывы клиентов
```typescript
id: number (PK)
customerName: string - Имя клиента
city: string - Город
rating: number - Оценка (1-5)
text: string - Текст отзыва
image: string - Фото попугая (URL)
deliveryMethod: string - Способ доставки
createdAt: timestamp
```

### Подключение к БД
- **Файл:** `./data/parrot_shop.db` (SQLite)
- **ORM:** Drizzle ORM
- **Конфиг:** `drizzle.config.ts`
- **Схема:** `shared/schema.ts`

---

## 🌐 API ENDPOINTS

### Товары
```
GET  /api/products
     Query: minPrice, maxPrice, inStock, sort, search
     Response: Product[]

GET  /api/products/:slug
     Response: Product

GET  /api/products/id/:id
     Response: Product

POST /api/products (admin)
     Body: InsertProduct
     Response: Product

PUT  /api/products/:id (admin)
     Body: Partial<InsertProduct>
     Response: Product

DELETE /api/products/:id (admin)
     Response: 204 No Content
```

### Заказы
```
POST /api/orders
     Body: {
       customerName: string
       customerPhone: string
       customerEmail?: string
       deliveryMethod: 'pickup'|'courier'|'cdek'|'post'
       city?: string
       address?: string
       apartment?: string
       comment?: string
       paymentMethod: 'cash'|'card_online'|'sbp'
       items: [{productId, quantity}]
     }
     Response: {
       orderNumber: string
       total: number
       telegramOrderId: string
     }
```

### Отзывы
```
GET  /api/reviews
     Response: Review[]

POST /api/reviews
     Body: InsertReview
     Response: Review
```

### Telegram
```
GET  /api/test-telegram
     Response: {message: string}

GET  /api/telegram-setup
     Response: {chatIds: number[], instructions: string[]}

POST /api/telegram/webhook
     Body: Telegram Update object
     Response: {ok: boolean}
```

---

## 🎨 FRONTEND СТРУКТУРА

### Страницы (client/src/pages/)

| Файл | Маршрут | Описание |
|------|---------|---------|
| Home.tsx | / | Главная страница с популярными товарами |
| Catalog.tsx | /catalog | Каталог с фильтрацией и поиском |
| ProductDetails.tsx | /product/:slug | Страница товара с описанием |
| Cart.tsx | /cart | Корзина покупок |
| Checkout.tsx | /checkout | Оформление заказа (форма) |
| Delivery.tsx | /delivery | Информация о доставке |
| Contacts.tsx | /contacts | Контакты и информация |
| Admin.tsx | /admin | Админ-панель (заглушка) |
| not-found.tsx | * | 404 страница |

### Компоненты (client/src/components/)

**Layout.tsx** - Основной layout (шапка, навигация, подвал)
**ProductCard.tsx** - Карточка товара в каталоге
**ReviewsCarousel.tsx** - Карусель отзывов на главной
**ui/** - shadcn/ui компоненты (button, input, dialog, etc.)

### Hooks (client/src/hooks/)

```typescript
use-products.ts    // Получение товаров с фильтрацией
use-cart.ts        // Управление корзиной (Zustand)
use-orders.ts      // Создание заказов
use-reviews.ts     // Получение отзывов
use-mobile.tsx     // Определение мобильного устройства
use-toast.ts       // Уведомления
```

### Маршрутизация
- **Router:** Wouter (легкий, для SPA)
- **Файл:** `client/src/App.tsx`
- **Конфиг:** Определены в `shared/routes.ts`

---

## 🔧 BACKEND СТРУКТУРА

### server/index.ts
Главный файл сервера. Инициализирует Express, регистрирует маршруты, настраивает middleware.

### server/routes.ts
Все API endpoints. Обработка запросов, валидация, отправка уведомлений в Telegram.

### server/storage.ts
Слой доступа к БД. Методы для CRUD операций с товарами, заказами, отзывами.

### server/db.ts
Инициализация SQLite подключения через Drizzle ORM. Создание таблиц при первом запуске.

### server/telegram.ts
**TelegramService** - класс для работы с Telegram Bot API:
- `sendToBot()` - отправка сообщений
- `sendWithInlineKeyboard()` - сообщения с кнопками
- `handleUpdate()` - обработка входящих обновлений
- `startPolling()` / `stopPolling()` - long polling
- `formatOrderMessage()` - форматирование уведомлений о заказах

### server/static.ts
Раздача статических файлов в production.

### server/vite.ts
Настройка Vite dev server в development режиме.

---

## 📦 SHARED ТИПЫ И СХЕМЫ

### shared/schema.ts
Определение таблиц Drizzle ORM и Zod схем для валидации:
- `products` table + `insertProductSchema`
- `orders` table + `insertOrderSchema`
- `orderItems` table
- `reviews` table + `insertReviewSchema`

Типы:
```typescript
type Product = {...}
type Order = {...}
type Review = {...}
type CreateOrderRequest = {...}
```

### shared/routes.ts
API контракт - определение всех endpoints с типами:
```typescript
api.products.list
api.products.get
api.products.getById
api.orders.create
api.reviews.list
api.reviews.create
```

---

## 🚀 ЗАПУСК И РАЗРАБОТКА

### Команды
```bash
npm run dev              # Запуск dev сервера (Vite + Express)
npm run build           # Сборка для production
npm start               # Запуск production
npm run check           # TypeScript проверка
npm run db:push         # Применить изменения схемы БД
npm run db:seed-reviews # Добавить тестовые отзывы
```

### Переменные окружения (.env.local)
```env
DATABASE_PATH=./data/parrot_shop.db
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# Telegram (опционально)
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=your_username
TELEGRAM_CHAT_ID=your_chat_id
```

### Первый запуск
1. `npm install`
2. `npm run dev`
3. Откройте http://localhost:5000
4. БД создастся автоматически с 20 товарами

---

## 💬 TELEGRAM БОТ

### Как работает
1. Клиент оформляет заказ на сайте
2. Получает ссылку на Telegram-бота с deep link
3. В боте видит детали заказа и кнопки подтверждения
4. Подтверждает заказ → статус обновляется
5. Может общаться с менеджером в боте

### Настройка
1. Создать бота через @BotFather
2. Получить токен и username
3. Добавить в `.env.local`
4. Получить Chat ID через `/api/telegram-setup`
5. Перезапустить сервер

### Файлы
- `server/telegram.ts` - TelegramService класс
- `TELEGRAM_SETUP.md` - Подробная инструкция

---

## 📱 МОБИЛЬНАЯ ОПТИМИЗАЦИЯ

Проект полностью оптимизирован под мобильные устройства:
- Touch-friendly кнопки (44x44px минимум)
- Адаптивные размеры шрифтов
- Предотвращение zoom при фокусе на input
- Smooth scrolling
- Оптимизированные изображения

**Файл:** `MOBILE_OPTIMIZATION.md`

---

## 🐳 DOCKER И ДЕПЛОЙ

### Docker
```dockerfile
# Build stage - сборка приложения
# Production stage - запуск в контейнере
```

### Docker Compose
```yaml
services:
  app:
    build: .
    ports: ["5000:5000"]
    volumes: ["./data:/app/data"]
    environment: [NODE_ENV, PORT, DATABASE_PATH, TELEGRAM_*]
```

### Деплой на Coolify
1. Подключить Git-репозиторий
2. Выбрать Docker Compose или Dockerfile
3. Добавить переменные окружения
4. Настроить persistent volume для `/app/data`
5. Deploy!

**Файл:** `DEPLOY.md`

---

## 🎯 КЛЮЧЕВЫЕ ОСОБЕННОСТИ

### Функциональность
✅ Каталог товаров с фильтрацией и поиском  
✅ Корзина с сохранением состояния (Zustand)  
✅ Оформление заказа с валидацией (Zod)  
✅ Несколько способов доставки и оплаты  
✅ Подтверждение заказа через Telegram-бот  
✅ Система отзывов с каруселью  
✅ Адаптивный дизайн (мобильный-first)  
✅ Админ-панель (заглушка)  

### Технические особенности
✅ TypeScript везде (frontend + backend)  
✅ Валидация данных (Zod)  
✅ Type-safe API контракт  
✅ SQLite с Drizzle ORM  
✅ React Query для кэширования  
✅ Tailwind CSS v4  
✅ shadcn/ui компоненты  
✅ Production-ready Docker setup  

---

## 📝 ВАЖНЫЕ ФАЙЛЫ

| Файл | Назначение |
|------|-----------|
| `client/src/App.tsx` | Маршрутизация и провайдеры |
| `server/index.ts` | Инициализация сервера |
| `server/routes.ts` | Все API endpoints |
| `shared/schema.ts` | Типы и схемы БД |
| `shared/routes.ts` | API контракт |
| `vite.config.ts` | Конфиг Vite |
| `tsconfig.json` | TypeScript конфиг |
| `package.json` | Зависимости и скрипты |
| `.env.example` | Пример переменных окружения |

---

## 🔍 ПОИСК И ФИЛЬТРАЦИЯ

### Каталог (Catalog.tsx)
- Поиск по названию товара
- Фильтр по цене (min-max)
- Фильтр "Только в наличии"
- Сортировка (популярность, цена, название)
- Активные фильтры отображаются как теги

### API
```
GET /api/products?search=название&minPrice=100&maxPrice=5000&inStock=true&sort=popular
```

---

## 🛒 КОРЗИНА

### Хранилище (Zustand)
- Сохраняется в localStorage
- Автоматически восстанавливается при загрузке
- Методы: addItem, removeItem, updateQuantity, clearCart

### Hook
```typescript
const { items, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
```

---

## 📦 ОФОРМЛЕНИЕ ЗАКАЗА

### Процесс
1. Заполнение контактных данных
2. Выбор способа доставки
3. Выбор способа оплаты
4. Подтверждение заказа
5. Редирект на Telegram-бота

### Валидация (Zod)
Все поля валидируются на frontend и backend.

### Доставка
- Курьер (300₽, бесплатно при заказе > 3000₽)
- Самовывоз (Москва)
- CDEK
- Почта России

### Оплата
- Наличные
- Карта онлайн
- СБП (Система быстрых платежей)

---

## 🎨 ДИЗАЙН И СТИЛИ

### Tailwind CSS v4
- Кастомные цвета в `tailwind.config.ts`
- Адаптивные классы (sm, md, lg, xl)
- Dark mode поддержка (next-themes)

### shadcn/ui
Используются компоненты:
- Button, Input, Textarea
- Select, RadioGroup, Checkbox
- Dialog, Sheet, Popover
- Card, Badge, Separator
- Form (react-hook-form интеграция)
- И другие...

### Иконки
- lucide-react для иконок
- react-icons для дополнительных

---

## 🔐 БЕЗОПАСНОСТЬ

### Валидация
- Zod на backend для всех входных данных
- React Hook Form на frontend

### Переменные окружения
- Никогда не коммитить `.env.local`
- Использовать `.env.example` как шаблон

### Telegram
- Токен хранится в переменных окружения
- Все запросы к API идут через HTTPS в production

---

## 🐛 ОТЛАДКА

### Логирование
- Backend: `console.log` в `server/` файлах
- Frontend: React DevTools, Network tab

### Проверка типов
```bash
npm run check
```

### Тестирование API
```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/test-telegram
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- `README.md` - Основная документация
- `DEPLOY.md` - Инструкция по деплою
- `TELEGRAM_SETUP.md` - Настройка Telegram-бота
- `MOBILE_OPTIMIZATION.md` - Мобильная оптимизация
- `DEPLOYMENT_GUIDE.md` - Альтернативный гайд деплоя

---

## 🎓 ПРИМЕРЫ КОДА

### Получение товаров
```typescript
const { data: products } = useProducts({ 
  sort: 'popular',
  minPrice: 1000,
  maxPrice: 50000
});
```

### Создание заказа
```typescript
const createOrder = useCreateOrder();
createOrder.mutate({
  customerName: 'Иван',
  customerPhone: '+7 999 123-45-67',
  deliveryMethod: 'courier',
  paymentMethod: 'card_online',
  items: [{productId: 1, quantity: 2}]
});
```

### Добавление в корзину
```typescript
const { addItem } = useCart();
addItem(product, quantity);
```

---

## ✅ ЧЕКЛИСТ ДЛЯ РАЗРАБОТКИ

При добавлении новой функции:
- [ ] Добавить типы в `shared/schema.ts`
- [ ] Добавить API endpoint в `server/routes.ts`
- [ ] Добавить метод в `server/storage.ts`
- [ ] Добавить hook в `client/src/hooks/`
- [ ] Добавить компонент в `client/src/components/`
- [ ] Добавить страницу в `client/src/pages/` (если нужно)
- [ ] Обновить маршруты в `shared/routes.ts`
- [ ] Протестировать на мобильных
- [ ] Запустить `npm run check`
- [ ] Обновить документацию

---

**Готово к разработке!** 🚀

Используйте этот документ как справочник при работе с проектом. Все основные компоненты, структура и процессы описаны выше.


---

## 🚀 ШПАРГАЛКА ДЛЯ БЫСТРОГО СТАРТА

### Добавить новый API endpoint

**1. Определить тип в `shared/routes.ts`:**
```typescript
export const api = {
  myFeature: {
    myEndpoint: {
      method: 'GET' as const,
      path: '/api/my-endpoint',
      input: z.object({ /* параметры */ }),
      responses: {
        200: z.object({ /* ответ */ }),
      },
    },
  },
};
```

**2. Добавить метод в `server/storage.ts`:**
```typescript
async myMethod(params: any): Promise<any> {
  // Логика работы с БД
  return result;
}
```

**3. Добавить route в `server/routes.ts`:**
```typescript
app.get(api.myFeature.myEndpoint.path, async (req, res) => {
  try {
    const input = api.myFeature.myEndpoint.input.parse(req.query);
    const result = await storage.myMethod(input);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});
```

**4. Создать hook в `client/src/hooks/use-my-feature.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';

export function useMyFeature(params?: any) {
  return useQuery({
    queryKey: ['myFeature', params],
    queryFn: async () => {
      const response = await fetch(`${api.myFeature.myEndpoint.path}?...`);
      return response.json();
    },
  });
}
```

**5. Использовать в компоненте:**
```typescript
const { data, isLoading } = useMyFeature(params);
```

---

### Добавить новую страницу

**1. Создать файл `client/src/pages/MyPage.tsx`:**
```typescript
import { Layout } from "@/components/Layout";

export default function MyPage() {
  return (
    <Layout>
      <div className="container py-12">
        {/* Содержимое */}
      </div>
    </Layout>
  );
}
```

**2. Добавить маршрут в `client/src/App.tsx`:**
```typescript
import MyPage from "@/pages/MyPage";

function Router() {
  return (
    <Switch>
      <Route path="/my-page" component={MyPage} />
      {/* ... */}
    </Switch>
  );
}
```

**3. Добавить ссылку в навигацию `client/src/components/Layout.tsx`:**
```typescript
<Link href="/my-page">Моя страница</Link>
```

---

### Добавить новый компонент UI

**1. Создать `client/src/components/MyComponent.tsx`:**
```typescript
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div className="p-4 rounded-lg bg-white border">
      <h3 className="font-bold">{title}</h3>
      <Button onClick={onClick}>Действие</Button>
    </div>
  );
}
```

**2. Использовать в других компонентах:**
```typescript
import { MyComponent } from "@/components/MyComponent";

export default function Page() {
  return <MyComponent title="Заголовок" onClick={() => {}} />;
}
```

---

### Работать с формами

**Используется react-hook-form + Zod:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  email: z.string().email("Неверный email"),
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Введите имя" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Отправить</Button>
      </form>
    </Form>
  );
}
```

---

### Работать с состоянием (Zustand)

**Пример из `client/src/hooks/use-cart.ts`:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) => {
        set((state) => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);
```

---

### Работать с React Query

**Получение данных:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['products', params],
  queryFn: async () => {
    const response = await fetch(`/api/products?...`);
    return response.json();
  },
});
```

**Мутация (POST/PUT/DELETE):**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  onSuccess: (data) => {
    console.log('Успех:', data);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  },
  onError: (error) => {
    console.error('Ошибка:', error);
  },
});

mutation.mutate(formData);
```

---

### Стилизация компонентов

**Tailwind CSS классы:**
```typescript
// Размеры
className="w-full h-12 p-4 m-2"

// Цвета
className="bg-primary text-white border-2 border-primary"

// Адаптивность
className="text-sm md:text-base lg:text-lg"

// Состояния
className="hover:bg-primary/90 active:scale-95 disabled:opacity-50"

// Flexbox
className="flex items-center justify-between gap-4"

// Grid
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"

// Скругление
className="rounded-lg md:rounded-2xl"

// Тени
className="shadow-md hover:shadow-xl transition-shadow"

// Анимация
className="animate-pulse transition-all duration-300"
```

---

### Отправка уведомления в Telegram

**В backend (server/routes.ts):**
```typescript
import { telegramService } from "./telegram";

// Простое сообщение
await telegramService.sendToBot("Текст сообщения", chatId);

// С кнопками
await telegramService.sendWithInlineKeyboard(
  "Текст сообщения",
  chatId,
  [
    [{ text: "Кнопка 1", callback_data: "action_1" }],
    [{ text: "Кнопка 2", callback_data: "action_2" }],
  ]
);
```

---

### Работать с изображениями

**Загрузка изображений:**
```typescript
// Используются URL с Unsplash или других источников
<img 
  src="https://images.unsplash.com/photo-...?auto=format&fit=crop&q=80&w=800"
  alt="Описание"
  className="w-full h-auto rounded-lg object-cover"
/>
```

**Оптимизация:**
- Используйте `object-cover` для правильного масштабирования
- Добавляйте `alt` текст для доступности
- Используйте `lazy loading` для больших списков

---

### Обработка ошибок

**На backend:**
```typescript
try {
  const result = await storage.getProduct(id);
  if (!result) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(result);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: (error as Error).message });
}
```

**На frontend:**
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['product', id],
  queryFn: async () => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },
});

if (error) {
  return <div className="text-red-500">Ошибка: {error.message}</div>;
}
```

---

### Типизация API запросов

**Используйте типы из `shared/routes.ts`:**
```typescript
import { api, CreateOrderInput } from '@shared/routes';

// Автоматическая типизация
const orderData: CreateOrderInput = {
  customerName: 'Иван',
  customerPhone: '+7 999 123-45-67',
  deliveryMethod: 'courier',
  paymentMethod: 'card_online',
  items: [{ productId: 1, quantity: 2 }],
};

// TypeScript проверит все поля и типы
```

---

### Отладка в development

**Логирование:**
```typescript
// Backend
console.log('Debug:', data);

// Frontend
console.log('Component rendered:', props);
```

**React DevTools:**
- Установить расширение React DevTools
- Инспектировать компоненты и их props
- Смотреть состояние (Zustand, React Query)

**Network tab:**
- Смотреть запросы к API
- Проверять статусы ответов
- Смотреть payload и response

**TypeScript проверка:**
```bash
npm run check
```

---

## 🎯 ЧАСТЫЕ ЗАДАЧИ

### Добавить новый фильтр в каталог

1. Добавить поле в `ProductQueryParams` в `shared/schema.ts`
2. Добавить параметр в API query в `server/routes.ts`
3. Добавить условие в `storage.getProducts()` в `server/storage.ts`
4. Добавить UI элемент в `client/src/pages/Catalog.tsx`
5. Обновить hook `useProducts()` в `client/src/hooks/use-products.ts`

### Изменить цвета и стили

1. Отредактировать `tailwind.config.ts` для глобальных цветов
2. Использовать Tailwind классы в компонентах
3. Для специфичных стилей добавить CSS в `client/src/index.css`

### Добавить новый способ доставки

1. Добавить значение в enum `deliveryMethod` в `shared/schema.ts`
2. Добавить логику расчета стоимости в `server/storage.ts` (метод `createOrder`)
3. Добавить UI опцию в `client/src/pages/Checkout.tsx`
4. Обновить текст в `server/telegram.ts` (метод `formatOrderMessage`)

### Добавить новый способ оплаты

1. Добавить значение в enum `paymentMethod` в `shared/schema.ts`
2. Добавить UI опцию в `client/src/pages/Checkout.tsx`
3. Добавить логику обработки в `server/routes.ts` (если нужна интеграция с платежной системой)
4. Обновить текст в `server/telegram.ts`

### Изменить структуру товара

1. Добавить/удалить поле в таблице `products` в `shared/schema.ts`
2. Обновить `insertProductSchema` для валидации
3. Обновить типы `Product` и `InsertProduct`
4. Обновить компоненты, которые используют товары
5. Запустить `npm run db:push` для миграции БД

---

## 📊 ПРОИЗВОДИТЕЛЬНОСТЬ

### Оптимизация

**Frontend:**
- React Query кэширует данные
- Lazy loading для изображений
- Code splitting через Vite
- Минификация в production

**Backend:**
- SQLite с индексами
- Кэширование запросов
- Пагинация для больших списков

**Сборка:**
```bash
npm run build  # Создает оптимизированный dist/
npm start      # Запускает production версию
```

---

## 🔒 БЕЗОПАСНОСТЬ

### Что уже реализовано
✅ Валидация всех входных данных (Zod)  
✅ Переменные окружения для чувствительных данных  
✅ HTTPS для Telegram API  
✅ Type-safe API контракт  

### Что нужно добавить при масштабировании
- [ ] Аутентификация пользователей
- [ ] Авторизация для админ-панели
- [ ] Rate limiting для API
- [ ] CORS конфигурация
- [ ] SQL injection protection (уже есть через ORM)
- [ ] XSS protection (React автоматически)
- [ ] CSRF tokens для форм

---

## 📈 МАСШТАБИРОВАНИЕ

### Если нужно больше товаров
- Добавить пагинацию в API
- Использовать виртуализацию списков (react-window)
- Добавить индексы в БД

### Если нужно больше пользователей
- Перейти с SQLite на PostgreSQL
- Добавить кэширование (Redis)
- Использовать CDN для статических файлов
- Добавить load balancing

### Если нужна интеграция с платежами
- Добавить Stripe/Yandex.Kassa
- Обновить логику в `server/routes.ts`
- Добавить webhook обработку

---

**Последнее обновление:** 31.01.2026  
**Версия документации:** 1.0
