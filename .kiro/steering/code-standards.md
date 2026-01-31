# 📝 Стандарты кода проекта

## TypeScript

**Всегда используйте типы:**
```typescript
// ✅ Правильно
interface Product {
  id: number;
  name: string;
  price: number;
}

function getProduct(id: number): Promise<Product> {
  // ...
}

// ❌ Неправильно
function getProduct(id: any): any {
  // ...
}
```

**Правила:**
- Никогда не используйте `any`
- Определяйте интерфейсы для props компонентов
- Используйте `type` для типов, `interface` для объектов
- Экспортируйте типы из `shared/schema.ts`

## Валидация данных (Zod)

**Всегда валидируйте входные данные:**
```typescript
// ✅ Правильно
const schema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  price: z.number().min(0, "Не может быть отрицательным"),
});

const data = schema.parse(input);

// ❌ Неправильно
if (input.name && input.price > 0) {
  // Обработка
}
```

**Правила:**
- Валидируйте на backend перед сохранением
- Валидируйте на frontend перед отправкой
- Используйте Zod для всех API контрактов
- Определяйте схемы в `shared/schema.ts`

## React компоненты

**Структура компонента:**
```typescript
// ✅ Правильно
interface ProductCardProps {
  product: Product;
  onAddToCart?: (quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{product.name}</h3>
      <p className="text-2xl">{product.price} ₽</p>
      {onAddToCart && (
        <button onClick={() => onAddToCart(quantity)}>
          В корзину
        </button>
      )}
    </div>
  );
}
```

**Правила:**
- Определяйте Props интерфейсы
- Используйте деструктуризацию props
- Экспортируйте компоненты как named exports
- Размещайте в `client/src/components/`

## Стили (Tailwind CSS)

**Используйте Tailwind классы:**
```typescript
// ✅ Правильно
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Кнопка
</button>

// ❌ Неправильно
<button style={{ padding: '8px 16px', backgroundColor: '#3b82f6' }}>
  Кнопка
</button>
```

**Правила:**
- Используйте Tailwind классы вместо inline styles
- Используйте адаптивные классы (md:, lg:)
- Используйте цвета из `tailwind.config.ts`
- Не создавайте CSS файлы для компонентов

## API endpoints

**Структура endpoint:**
```typescript
// ✅ Правильно
app.get(api.products.list.path, async (req, res) => {
  try {
    const query = api.products.list.input.optional().parse(req.query);
    const products = await storage.getProducts(query);
    res.json(products);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: (err as Error).message });
  }
});
```

**Правила:**
- Валидируйте входные данные
- Обрабатывайте ошибки
- Возвращайте правильные статус коды
- Определяйте endpoints в `server/routes.ts`

## Обработка ошибок

**Всегда обрабатывайте ошибки:**
```typescript
// ✅ Правильно
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

// ❌ Неправильно
const result = await storage.getProduct(id);
res.json(result); // Может быть undefined!
```

**Правила:**
- Проверяйте результаты функций
- Обрабатывайте исключения
- Логируйте ошибки
- Не выставляйте stack traces в production

## Состояние (Zustand)

**Используйте Zustand для локального состояния:**
```typescript
// ✅ Правильно
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) => {
        set((state) => ({
          items: [...state.items, { product, quantity }],
        }));
      },
    }),
    { name: 'cart-storage' }
  )
);

// ❌ Неправильно
const [items, setItems] = useState([]);
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(items));
}, [items]);
```

**Правила:**
- Используйте Zustand для состояния, которое нужно сохранять
- Используйте React Query для серверного состояния
- Используйте useState для временного состояния компонента

## React Query

**Используйте React Query для серверного состояния:**
```typescript
// ✅ Правильно
const { data, isLoading, error } = useQuery({
  queryKey: ['products', params],
  queryFn: async () => {
    const response = await fetch(`/api/products?...`);
    return response.json();
  },
});

// ❌ Неправильно
const [products, setProducts] = useState([]);
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setProducts);
}, []);
```

**Правила:**
- Используйте React Query для API запросов
- Кэшируйте данные автоматически
- Инвалидируйте кэш после мутаций
- Определяйте hooks в `client/src/hooks/`

## Именование

**Следуйте соглашениям:**
```typescript
// ✅ Правильно
const getUserById = (id: number) => { /* ... */ };
const isLoading = true;
const MAX_RETRIES = 3;
const ProductCard = () => { /* ... */ };

// ❌ Неправильно
const get_user_by_id = (id: number) => { /* ... */ };
const loading = true;
const maxRetries = 3;
const productCard = () => { /* ... */ };
```

**Правила:**
- camelCase для переменных и функций
- PascalCase для компонентов и классов
- UPPER_SNAKE_CASE для констант
- Используйте понятные имена

## Комментарии

**Комментируйте сложный код:**
```typescript
// ✅ Правильно
// Получить товары с фильтрацией по цене
const products = await storage.getProducts({ 
  minPrice: 100, 
  maxPrice: 5000 
});

// ❌ Неправильно
// Получить товары
const products = await storage.getProducts();
```

**Правила:**
- Комментируйте "почему", а не "что"
- Используйте JSDoc для функций
- Не комментируйте очевидный код
- Обновляйте комментарии при изменении кода

## Импорты

**Организуйте импорты:**
```typescript
// ✅ Правильно
// Внешние библиотеки
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Внутренние модули
import { Layout } from '@/components/Layout';
import { useProducts } from '@/hooks/use-products';
import type { Product } from '@shared/schema';

// ❌ Неправильно
import type { Product } from '@shared/schema';
import { Layout } from '@/components/Layout';
import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
```

**Правила:**
- Сортируйте импорты: внешние → внутренние
- Используйте path aliases (@/, @shared/)
- Используйте type imports для типов
- Группируйте импорты по категориям

---

**Следуйте этим стандартам во всех файлах!**
