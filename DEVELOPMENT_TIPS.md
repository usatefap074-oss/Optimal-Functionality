# 💡 DEVELOPMENT TIPS - Советы по разработке

## 🎯 Лучшие практики

### 1. Типизация

**✅ Хорошо:**
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

function getProduct(id: number): Promise<Product> {
  // ...
}
```

**❌ Плохо:**
```typescript
function getProduct(id: any): any {
  // ...
}
```

**Совет:** Всегда используйте типы. TypeScript поймет вас и предотвратит ошибки.

---

### 2. Валидация данных

**✅ Хорошо:**
```typescript
const schema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

const data = schema.parse(input);
```

**❌ Плохо:**
```typescript
if (input.name && input.price > 0) {
  // Обработка
}
```

**Совет:** Используйте Zod для валидации. Это безопаснее и понятнее.

---

### 3. Обработка ошибок

**✅ Хорошо:**
```typescript
try {
  const result = await storage.getProduct(id);
  if (!result) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json(result);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal error' });
}
```

**❌ Плохо:**
```typescript
const result = await storage.getProduct(id);
res.json(result); // Может быть undefined!
```

**Совет:** Всегда обрабатывайте ошибки и проверяйте результаты.

---

### 4. Состояние компонентов

**✅ Хорошо:**
```typescript
// Используйте React Query для серверного состояния
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch('/api/products');
    return response.json();
  },
});

// Используйте Zustand для локального состояния
const { items, addItem } = useCart();
```

**❌ Плохо:**
```typescript
// Не используйте useState для серверного состояния
const [products, setProducts] = useState([]);
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setProducts);
}, []);
```

**Совет:** React Query кэширует данные и обрабатывает ошибки. Zustand легче, чем Redux.

---

### 5. Компоненты

**✅ Хорошо:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price} ₽</p>
      {onAddToCart && (
        <button onClick={() => onAddToCart(1)}>Add</button>
      )}
    </div>
  );
}
```

**❌ Плохо:**
```typescript
export function ProductCard(props: any) {
  return (
    <div>
      <h3>{props.product.name}</h3>
      <p>{props.product.price} ₽</p>
    </div>
  );
}
```

**Совет:** Определяйте Props интерфейсы. Это делает компоненты переиспользуемыми.

---

### 6. Стили

**✅ Хорошо:**
```typescript
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Click me
</button>
```

**❌ Плохо:**
```typescript
<button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white' }}>
  Click me
</button>
```

**Совет:** Используйте Tailwind классы. Они быстрее и консистентнее.

---

## 🔍 Отладка

### 1. Логирование

```typescript
// Backend
console.log('Debug:', { userId, action, timestamp: new Date() });

// Frontend
console.log('Component rendered:', { props, state });
```

### 2. React DevTools

- Установите расширение React DevTools
- Инспектируйте компоненты
- Смотрите props и state
- Профилируйте производительность

### 3. Network Tab

- Откройте DevTools → Network
- Смотрите запросы к API
- Проверяйте статусы ответов
- Смотрите payload и response

### 4. TypeScript проверка

```bash
npm run check
```

### 5. Логи сервера

```bash
npm run dev
# Смотрите логи в консоли
```

---

## ⚡ Производительность

### 1. React Query кэширование

```typescript
// Данные кэшируются автоматически
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 10 * 60 * 1000, // 10 минут
});
```

### 2. Lazy loading изображений

```typescript
<img 
  src={url}
  alt="description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### 3. Code splitting

Vite автоматически разбивает код на чанки.

### 4. Минификация

```bash
npm run build
# Создает оптимизированный dist/
```

---

## 🔐 Безопасность

### 1. Никогда не коммитьте секреты

```bash
# ✅ Хорошо
echo ".env.local" >> .gitignore

# ❌ Плохо
git add .env.local
```

### 2. Валидируйте входные данные

```typescript
// ✅ Хорошо
const schema = z.object({ email: z.string().email() });
const data = schema.parse(input);

// ❌ Плохо
if (input.email.includes('@')) {
  // Обработка
}
```

### 3. Используйте HTTPS в production

```typescript
// ✅ Хорошо
const url = 'https://api.example.com/...';

// ❌ Плохо
const url = 'http://api.example.com/...';
```

### 4. Не выставляйте stack traces

```typescript
// ✅ Хорошо
res.status(500).json({ message: 'Internal error' });

// ❌ Плохо
res.status(500).json({ error: error.stack });
```

---

## 📝 Код-стайл

### 1. Именование

```typescript
// ✅ Хорошо
const getUserById = (id: number) => { /* ... */ };
const isLoading = true;
const MAX_RETRIES = 3;

// ❌ Плохо
const get_user_by_id = (id: number) => { /* ... */ };
const loading = true;
const maxRetries = 3;
```

### 2. Функции

```typescript
// ✅ Хорошо
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ Плохо
function calc(items: any): any {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}
```

### 3. Комментарии

```typescript
// ✅ Хорошо
// Получить товары с фильтрацией по цене
const products = await storage.getProducts({ minPrice: 100, maxPrice: 5000 });

// ❌ Плохо
// Получить товары
const products = await storage.getProducts();
```

---

## 🚀 Оптимизация запросов

### 1. Используйте индексы в БД

```typescript
// В schema.ts
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // Индекс!
  name: text("name").notNull(),
  // ...
});
```

### 2. Кэшируйте результаты

```typescript
// React Query кэширует автоматически
const { data } = useQuery({
  queryKey: ['products', params],
  queryFn: fetchProducts,
});
```

### 3. Пагинируйте большие списки

```typescript
// Вместо получения всех товаров
const { data: products } = useQuery({
  queryKey: ['products', page],
  queryFn: () => fetch(`/api/products?page=${page}`),
});
```

---

## 🧪 Тестирование

### 1. Тестируйте API вручную

```bash
# Получить товары
curl http://localhost:5000/api/products

# Создать заказ
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Ivan","customerPhone":"+7999123456","items":[{"productId":1,"quantity":1}]}'
```

### 2. Тестируйте на мобильных

- Используйте DevTools → Device Emulation
- Или тестируйте на реальном устройстве
- Проверяйте touch-события

### 3. Тестируйте Telegram

```bash
# Тест уведомлений
curl http://localhost:5000/api/test-telegram

# Получить Chat ID
curl http://localhost:5000/api/telegram-setup
```

---

## 📚 Документирование

### 1. Комментируйте сложный код

```typescript
// Вычисляем стоимость доставки:
// - Бесплатно если заказ > 3000₽
// - 300₽ если заказ < 3000₽
// - Бесплатно для самовывоза
const deliveryCost = calculateDeliveryCost(total, method);
```

### 2. Документируйте функции

```typescript
/**
 * Получить товары с фильтрацией
 * @param params - Параметры фильтрации
 * @param params.minPrice - Минимальная цена
 * @param params.maxPrice - Максимальная цена
 * @param params.sort - Сортировка (popular, price_asc, price_desc, name)
 * @returns Массив товаров
 */
async function getProducts(params?: ProductQueryParams): Promise<Product[]> {
  // ...
}
```

### 3. Обновляйте документацию

Когда вы добавляете новую функцию, обновите:
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
- [CODE_EXAMPLES.md](./CODE_EXAMPLES.md)
- Комментарии в коде

---

## 🎯 Частые ошибки

### 1. Забыли обновить кэш

```typescript
// ❌ Неправильно
const mutation = useMutation({
  mutationFn: createOrder,
  // Кэш не обновляется!
});

// ✅ Правильно
const mutation = useMutation({
  mutationFn: createOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  },
});
```

### 2. Забыли обработать ошибку

```typescript
// ❌ Неправильно
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

// ✅ Правильно
const { data, error, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

if (error) return <div>Ошибка: {error.message}</div>;
if (isLoading) return <div>Загрузка...</div>;
```

### 3. Забыли типизировать

```typescript
// ❌ Неправильно
const product = data[0]; // Может быть undefined!

// ✅ Правильно
const product: Product | undefined = data?.[0];
if (!product) return <div>Товар не найден</div>;
```

### 4. Забыли валидировать

```typescript
// ❌ Неправильно
const order = req.body; // Может быть что угодно!

// ✅ Правильно
const order = api.orders.create.input.parse(req.body);
```

---

## 🔄 Git workflow

### 1. Коммиты

```bash
# ✅ Хорошо
git commit -m "Add product filter by price"
git commit -m "Fix cart total calculation"

# ❌ Плохо
git commit -m "fix"
git commit -m "update"
```

### 2. Ветки

```bash
# ✅ Хорошо
git checkout -b feature/product-filter
git checkout -b fix/cart-bug

# ❌ Плохо
git checkout -b my-changes
git checkout -b test
```

### 3. Pull requests

- Описывайте изменения
- Ссылайтесь на issues
- Просите review
- Проверяйте CI/CD

---

## 📊 Мониторинг

### 1. Логирование

```typescript
// Backend
console.log(`[${new Date().toISOString()}] GET /api/products - 200 OK`);

// Frontend
console.log('Product added to cart:', { productId, quantity });
```

### 2. Ошибки

```typescript
// Backend
console.error('Database error:', error);

// Frontend
console.error('API error:', error.message);
```

### 3. Метрики

- Время ответа API
- Размер bundle
- Производительность компонентов
- Ошибки в production

---

## 🎓 Ресурсы для обучения

### Документация

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)

### Видео

- React: https://www.youtube.com/watch?v=Tn6-PIqc4UM
- TypeScript: https://www.youtube.com/watch?v=gieEQFLvxOU
- Tailwind: https://www.youtube.com/watch?v=lCxcTsOHrjo

### Статьи

- React Best Practices
- TypeScript Tips and Tricks
- Tailwind CSS Advanced Techniques

---

## ✅ Чеклист перед коммитом

- [ ] Код типизирован (TypeScript)
- [ ] Нет ошибок TypeScript (`npm run check`)
- [ ] Данные валидированы (Zod)
- [ ] Ошибки обработаны
- [ ] Компоненты переиспользуемы
- [ ] Стили используют Tailwind
- [ ] Нет console.log в production коде
- [ ] Нет секретов в коде
- [ ] Документация обновлена
- [ ] Тестировано на мобильных

---

## 🚀 Готово!

Используйте эти советы для написания качественного кода. Удачи! 🦜
