# 💻 CODE EXAMPLES - Примеры кода

## 🎯 Типичные задачи и решения

---

## 1️⃣ РАБОТА С ТОВАРАМИ

### Получить список товаров с фильтрацией

**Frontend (React Hook):**
```typescript
// client/src/hooks/use-products.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';

export function useProducts(params?: any) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.minPrice) query.append('minPrice', params.minPrice);
      if (params?.maxPrice) query.append('maxPrice', params.maxPrice);
      if (params?.inStock) query.append('inStock', 'true');
      if (params?.sort) query.append('sort', params.sort);
      if (params?.search) query.append('search', params.search);
      
      const response = await fetch(`${api.products.list.path}?${query}`);
      return response.json();
    },
  });
}
```

**Использование в компоненте:**
```typescript
export default function Catalog() {
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [sort, setSort] = useState('popular');
  
  const { data: products = [], isLoading } = useProducts({
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sort,
  });

  return (
    <div>
      <Slider value={priceRange} onValueChange={setPriceRange} />
      <Select value={sort} onValueChange={setSort}>
        <SelectItem value="popular">По популярности</SelectItem>
        <SelectItem value="price_asc">Дешевле</SelectItem>
        <SelectItem value="price_desc">Дороже</SelectItem>
      </Select>
      
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Получить один товар по slug

**Frontend:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';

export default function ProductDetails() {
  const { slug } = useParams();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p className="text-2xl font-bold">{product.price} ₽</p>
      <p>{product.description}</p>
      <div>
        {product.specs.map(spec => (
          <div key={spec.key}>
            <strong>{spec.key}:</strong> {spec.value}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Добавить новый товар (Admin)

**Backend (server/routes.ts):**
```typescript
app.post("/api/products", async (req, res) => {
  try {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});
```

**Frontend (Admin Panel):**
```typescript
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertProductSchema } from '@shared/schema';

export function AddProductForm() {
  const form = useForm({
    resolver: zodResolver(insertProductSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      alert('Товар добавлен!');
      form.reset();
    },
  });

  return (
    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
      <input {...form.register('name')} placeholder="Название" />
      <input {...form.register('price', { valueAsNumber: true })} placeholder="Цена" />
      <textarea {...form.register('description')} placeholder="Описание" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавляю...' : 'Добавить'}
      </button>
    </form>
  );
}
```

---

## 2️⃣ РАБОТА С КОРЗИНОЙ

### Добавить товар в корзину

**Hook (client/src/hooks/use-cart.ts):**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

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
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
    }),
    { name: 'cart-storage' }
  )
);
```

**Использование в компоненте:**
```typescript
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="border rounded-lg p-4">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="text-2xl font-bold">{product.price} ₽</p>
      
      <div className="flex items-center gap-2 my-4">
        <Button 
          variant="outline" 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          −
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button 
          variant="outline" 
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </Button>
      </div>
      
      <Button 
        className="w-full"
        onClick={() => addItem(product, quantity)}
      >
        В корзину
      </Button>
    </div>
  );
}
```

### Показать корзину

```typescript
export function Cart() {
  const { items, totalPrice, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return <div>Корзина пуста</div>;
  }

  return (
    <div>
      <h1>Корзина</h1>
      
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.product.id} className="flex gap-4 border-b pb-4">
            <img 
              src={item.product.image} 
              alt={item.product.name}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-1">
              <h3 className="font-bold">{item.product.name}</h3>
              <p className="text-muted-foreground">{item.product.price} ₽</p>
              
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  −
                </Button>
                <span>{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold">
                {(item.product.price * item.quantity).toLocaleString()} ₽
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeItem(item.product.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-right">
        <p className="text-2xl font-bold">
          Итого: {totalPrice().toLocaleString()} ₽
        </p>
        <Link href="/checkout">
          <Button size="lg" className="mt-4">
            Оформить заказ
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## 3️⃣ ОФОРМЛЕНИЕ ЗАКАЗА

### Форма оформления заказа

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '@/hooks/use-cart';
import { useLocation } from 'wouter';

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Обязательное поле'),
  customerPhone: z.string().min(1, 'Обязательное поле'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  deliveryMethod: z.enum(['pickup', 'courier', 'cdek', 'post']),
  city: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  comment: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card_online', 'sbp']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: 'courier',
      paymentMethod: 'card_online',
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      // Открыть Telegram бота
      window.open(`https://t.me/papugasik_bot?start=${data.telegramOrderId}`, '_blank');
      setLocation('/');
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrder.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Контактные данные */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Контактные данные</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя и фамилия</label>
            <input 
              {...form.register('customerName')}
              className="w-full border rounded px-3 py-2"
              placeholder="Иван Иванов"
            />
            {form.formState.errors.customerName && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.customerName.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input 
              {...form.register('customerPhone')}
              className="w-full border rounded px-3 py-2"
              placeholder="+7 (999) 000-00-00"
            />
            {form.formState.errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.customerPhone.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email (опционально)</label>
            <input 
              {...form.register('customerEmail')}
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="ivan@example.com"
            />
          </div>
        </div>
      </section>

      {/* Доставка */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Способ доставки</h2>
        
        <div className="space-y-3">
          {['courier', 'pickup', 'cdek', 'post'].map(method => (
            <label key={method} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="radio"
                {...form.register('deliveryMethod')}
                value={method}
              />
              <span className="font-medium">
                {method === 'courier' && 'Курьером'}
                {method === 'pickup' && 'Самовывоз'}
                {method === 'cdek' && 'CDEK'}
                {method === 'post' && 'Почта России'}
              </span>
            </label>
          ))}
        </div>
        
        {form.watch('deliveryMethod') !== 'pickup' && (
          <div className="mt-4 space-y-3">
            <input 
              {...form.register('city')}
              className="w-full border rounded px-3 py-2"
              placeholder="Город"
            />
            <input 
              {...form.register('address')}
              className="w-full border rounded px-3 py-2"
              placeholder="Улица, дом"
            />
            <input 
              {...form.register('apartment')}
              className="w-full border rounded px-3 py-2"
              placeholder="Квартира/офис"
            />
          </div>
        )}
      </section>

      {/* Оплата */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
        
        <div className="space-y-3">
          {['card_online', 'sbp', 'cash'].map(method => (
            <label key={method} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="radio"
                {...form.register('paymentMethod')}
                value={method}
              />
              <span className="font-medium">
                {method === 'card_online' && 'Карта онлайн'}
                {method === 'sbp' && 'СБП'}
                {method === 'cash' && 'Наличные'}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Итого */}
      <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Итого к оплате:</p>
          <p className="text-3xl font-bold">{totalPrice().toLocaleString()} ₽</p>
        </div>
        <button 
          type="submit"
          disabled={createOrder.isPending}
          className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {createOrder.isPending ? 'Оформляю...' : 'Оформить заказ'}
        </button>
      </div>
    </form>
  );
}
```

---

## 4️⃣ TELEGRAM БОТ

### Отправить уведомление о заказе

**Backend (server/routes.ts):**
```typescript
app.post(api.orders.create.path, async (req, res) => {
  try {
    const input = api.orders.create.input.parse(req.body);
    const result = await storage.createOrder(input);
    
    // Получить информацию о товарах
    const products = new Map();
    for (const item of input.items) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        products.set(item.productId, product);
      }
    }
    
    // Форматировать и отправить сообщение
    const message = telegramService.formatOrderMessage(
      result.orderNumber,
      input,
      products,
      result.total
    );
    
    await telegramService.sendToBot(message);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});
```

### Обработать подтверждение заказа в боте

**Backend (server/telegram.ts):**
```typescript
async handleOrderConfirmation(chatId: number, telegramOrderId: string): Promise<void> {
  const order = await storage.getOrderByTelegramId(telegramOrderId);
  
  if (!order) {
    await this.sendToBot(
      "❌ Заказ не найден. Проверьте ссылку или обратитесь в поддержку.",
      chatId.toString()
    );
    return;
  }

  const message = 
    `🛒 <b>Заказ #${order.orderNumber}</b>\n\n` +
    `👤 ${order.customerName}\n` +
    `📱 ${order.customerPhone}\n` +
    `💰 ${order.total.toLocaleString('ru-RU')} ₽\n\n` +
    `Подтвердите заказ:`;

  await this.sendWithInlineKeyboard(
    message,
    chatId.toString(),
    [
      [
        { text: "✅ Подтвердить", callback_data: `confirm_${telegramOrderId}` },
        { text: "❌ Отменить", callback_data: `cancel_${telegramOrderId}` }
      ]
    ]
  );
}

private async confirmOrder(chatId: number, messageId: number, telegramOrderId: string): Promise<void> {
  const order = await storage.confirmOrderByTelegramId(telegramOrderId);
  
  if (!order) {
    await this.sendToBot("❌ Ошибка подтверждения заказа.", chatId.toString());
    return;
  }

  // Отредактировать сообщение
  await fetch(`${this.apiUrl}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: `✅ <b>Заказ #${order.orderNumber} подтвержден!</b>\n\nСпасибо! Мы начали обработку вашего заказа.`,
      parse_mode: "HTML"
    }),
  });
}
```

---

## 5️⃣ ОТЗЫВЫ

### Получить отзывы

```typescript
import { useQuery } from '@tanstack/react-query';

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const response = await fetch('/api/reviews');
      return response.json();
    },
  });
}
```

### Показать карусель отзывов

```typescript
import { useReviews } from '@/hooks/use-reviews';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';

export function ReviewsCarousel() {
  const { data: reviews = [], isLoading } = useReviews();

  if (isLoading) return <div>Загрузка отзывов...</div>;

  return (
    <Carousel>
      <CarouselContent>
        {reviews.map(review => (
          <CarouselItem key={review.id} className="md:basis-1/3">
            <div className="border rounded-lg p-6 h-full flex flex-col">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="flex-1 mb-4">{review.text}</p>
              
              <div className="flex items-center gap-3">
                <img 
                  src={review.image} 
                  alt={review.customerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{review.customerName}</p>
                  <p className="text-sm text-muted-foreground">{review.city}</p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

---

## 6️⃣ ВАЛИДАЦИЯ ДАННЫХ

### Использовать Zod для валидации

```typescript
import { z } from 'zod';

// Определить схему
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  description: z.string().min(10, 'Описание должно быть минимум 10 символов'),
  inStock: z.boolean().default(true),
  images: z.array(z.string().url()).min(1, 'Минимум одно изображение'),
});

// Валидировать данные
try {
  const validData = productSchema.parse(inputData);
  console.log('Данные валидны:', validData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Ошибки валидации:', error.errors);
  }
}
```

### Использовать в React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <p className="text-red-500">{form.formState.errors.email.message}</p>
      )}
      
      <input {...form.register('password')} type="password" />
      {form.formState.errors.password && (
        <p className="text-red-500">{form.formState.errors.password.message}</p>
      )}
      
      <button type="submit">Войти</button>
    </form>
  );
}
```

---

## 7️⃣ СТИЛИЗАЦИЯ

### Адаптивный дизайн

```typescript
export function ResponsiveComponent() {
  return (
    <div className="container">
      {/* Мобильный: 1 колонка, Планшет: 2 колонки, Десктоп: 3 колонки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>Элемент 1</div>
        <div>Элемент 2</div>
        <div>Элемент 3</div>
      </div>

      {/* Адаптивные размеры текста */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
        Заголовок
      </h1>

      {/* Адаптивные отступы */}
      <div className="p-4 md:p-6 lg:p-8">
        Содержимое с адаптивными отступами
      </div>

      {/* Скрыть на мобильных */}
      <div className="hidden md:block">
        Видно только на планшетах и выше
      </div>

      {/* Показать только на мобильных */}
      <div className="md:hidden">
        Видно только на мобильных
      </div>
    </div>
  );
}
```

### Темные цвета и состояния

```typescript
export function StyledButton() {
  return (
    <button className="
      px-6 py-3
      bg-primary text-white
      hover:bg-primary/90
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      rounded-lg font-bold
      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    ">
      Кнопка
    </button>
  );
}
```

---

**Используйте эти примеры как шаблоны для своего кода!**
