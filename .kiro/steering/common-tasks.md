# 🎯 Типичные задачи и решения

## Добавить новый API endpoint

### Шаг 1: Определить тип в `shared/routes.ts`
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

### Шаг 2: Добавить метод в `server/storage.ts`
```typescript
async myMethod(params: any): Promise<any> {
  // Логика работы с БД
  return result;
}
```

### Шаг 3: Добавить route в `server/routes.ts`
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

### Шаг 4: Создать hook в `client/src/hooks/use-my-feature.ts`
```typescript
import { useQuery } from '@tanstack/react-query';

export function useMyFeature(params?: any) {
  return useQuery({
    queryKey: ['myFeature', params],
    queryFn: async () => {
      const response = await fetch(`/api/my-endpoint?...`);
      return response.json();
    },
  });
}
```

### Шаг 5: Использовать в компоненте
```typescript
const { data, isLoading } = useMyFeature(params);
```

---

## Добавить новую страницу

### Шаг 1: Создать файл `client/src/pages/MyPage.tsx`
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

### Шаг 2: Добавить маршрут в `client/src/App.tsx`
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

### Шаг 3: Добавить ссылку в навигацию `client/src/components/Layout.tsx`
```typescript
<Link href="/my-page">Моя страница</Link>
```

---

## Добавить новый компонент UI

### Шаг 1: Создать `client/src/components/MyComponent.tsx`
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

### Шаг 2: Использовать в других компонентах
```typescript
import { MyComponent } from "@/components/MyComponent";

export default function Page() {
  return <MyComponent title="Заголовок" onClick={() => {}} />;
}
```

---

## Добавить новый фильтр в каталог

### Шаг 1: Обновить `shared/schema.ts`
```typescript
export interface ProductQueryParams {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  category?: string; // Новый фильтр
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'name';
  search?: string;
}
```

### Шаг 2: Обновить `server/storage.ts`
```typescript
async getProducts(params?: ProductQueryParams): Promise<Product[]> {
  const conditions = [];
  
  if (params?.category) {
    conditions.push(eq(products.category, params.category));
  }
  
  // ... остальные условия
}
```

### Шаг 3: Обновить `client/src/pages/Catalog.tsx`
```typescript
const [category, setCategory] = useState<string>();

const { data: products } = useProducts({
  category,
  // ... остальные параметры
});

// Добавить UI для выбора категории
<Select value={category} onValueChange={setCategory}>
  <SelectItem value="корма">Корма</SelectItem>
  <SelectItem value="клетки">Клетки</SelectItem>
  {/* ... */}
</Select>
```

---

## Добавить новый способ доставки

### Шаг 1: Обновить enum в `shared/schema.ts`
```typescript
export const orders = sqliteTable("orders", {
  // ...
  deliveryMethod: text("delivery_method").notNull(), // 'pickup'|'courier'|'cdek'|'post'|'express'
  // ...
});
```

### Шаг 2: Обновить логику в `server/storage.ts`
```typescript
let deliveryCost = 0;
if (req.deliveryMethod === 'express') {
  deliveryCost = 500; // Стоимость экспресс-доставки
}
```

### Шаг 3: Обновить UI в `client/src/pages/Checkout.tsx`
```typescript
<FormItem className="flex items-center space-x-3">
  <FormControl>
    <RadioGroupItem value="express" />
  </FormControl>
  <FormLabel className="font-normal">
    <span className="block font-bold">Экспресс-доставка</span>
    <span className="text-sm text-muted-foreground">500₽</span>
  </FormLabel>
</FormItem>
```

### Шаг 4: Обновить текст в `server/telegram.ts`
```typescript
const deliveryText = {
  pickup: "Самовывоз",
  courier: "Курьер",
  cdek: "CDEK",
  post: "Почта России",
  express: "Экспресс-доставка",
}[order.deliveryMethod];
```

---

## Добавить новый способ оплаты

### Шаг 1: Обновить enum в `shared/schema.ts`
```typescript
paymentMethod: z.enum(['cash', 'card_online', 'sbp', 'yandex_kassa']),
```

### Шаг 2: Обновить UI в `client/src/pages/Checkout.tsx`
```typescript
<FormItem className="flex items-center space-x-3">
  <FormControl>
    <RadioGroupItem value="yandex_kassa" />
  </FormControl>
  <FormLabel className="font-normal">
    <span className="block font-bold">Яндекс.Касса</span>
  </FormLabel>
</FormItem>
```

### Шаг 3: Обновить логику в `server/routes.ts`
```typescript
if (order.paymentMethod === 'yandex_kassa') {
  // Интеграция с Яндекс.Касса
  const paymentUrl = await createYandexKassaPayment(order);
  // ...
}
```

### Шаг 4: Обновить текст в `server/telegram.ts`
```typescript
const paymentText = {
  cash: "Наличные",
  card_online: "Карта онлайн",
  sbp: "СБП",
  yandex_kassa: "Яндекс.Касса",
}[order.paymentMethod];
```

---

## Изменить структуру товара

### Шаг 1: Обновить таблицу в `shared/schema.ts`
```typescript
export const products = sqliteTable("products", {
  // ... существующие поля
  color: text("color"), // Новое поле
  size: text("size"),   // Новое поле
});
```

### Шаг 2: Обновить схему валидации
```typescript
export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true })
  .extend({
    color: z.string().optional(),
    size: z.string().optional(),
  });
```

### Шаг 3: Обновить типы
```typescript
export type Product = Omit<typeof products.$inferSelect, 'images' | 'specs'> & {
  images: string[];
  specs: { key: string; value: string }[];
  color?: string;
  size?: string;
};
```

### Шаг 4: Обновить компоненты
```typescript
<div>
  <p>Цвет: {product.color}</p>
  <p>Размер: {product.size}</p>
</div>
```

### Шаг 5: Миграция БД
```bash
npm run db:push
```

---

## Работать с формами

### Использовать react-hook-form + Zod
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  );
}
```

---

## Отправить уведомление в Telegram

### Backend
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

## Оптимизировать производительность

### 1. Добавить пагинацию
```typescript
const { data: products } = useQuery({
  queryKey: ['products', page],
  queryFn: () => fetch(`/api/products?page=${page}`),
});
```

### 2. Использовать React Query кэширование
```typescript
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 10 * 60 * 1000, // 10 минут
});
```

### 3. Lazy loading изображений
```typescript
<img 
  src={url}
  alt="description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### 4. Добавить индексы в БД
```typescript
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // Индекс!
  // ...
});
```

---

**Используйте эти шаблоны для типичных задач!**
