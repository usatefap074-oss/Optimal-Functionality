# 🏗️ ARCHITECTURE - Архитектура проекта

## 📊 Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    КЛИЕНТ (React + Vite)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages (Home, Catalog, Cart, Checkout, etc.)          │   │
│  │ ├─ Components (ProductCard, Layout, etc.)            │   │
│  │ ├─ Hooks (useProducts, useCart, useOrders, etc.)     │   │
│  │ └─ Lib (queryClient, utils)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ HTTP                              │
├─────────────────────────────────────────────────────────────┤
│                   СЕРВЕР (Express + Node.js)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes (API endpoints)                               │   │
│  │ ├─ /api/products                                     │   │
│  │ ├─ /api/orders                                       │   │
│  │ ├─ /api/reviews                                      │   │
│  │ └─ /api/telegram/*                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Storage (Database queries)                           │   │
│  │ ├─ getProducts()                                     │   │
│  │ ├─ createOrder()                                     │   │
│  │ ├─ getReviews()                                      │   │
│  │ └─ ...                                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database (SQLite)                                    │   │
│  │ ├─ products                                          │   │
│  │ ├─ orders                                            │   │
│  │ ├─ orderItems                                        │   │
│  │ └─ reviews                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Telegram Service                                     │   │
│  │ ├─ sendToBot()                                       │   │
│  │ ├─ handleUpdate()                                    │   │
│  │ └─ startPolling()                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ HTTPS                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                   Telegram Bot API
```

---

## 🔄 Поток данных

### 1. Получение товаров

```
User clicks "Catalog"
    ↓
Catalog.tsx renders
    ↓
useProducts() hook called
    ↓
React Query fetches /api/products?sort=popular
    ↓
server/routes.ts GET /api/products
    ↓
storage.getProducts() queries SQLite
    ↓
Returns Product[]
    ↓
React Query caches data
    ↓
ProductCard components render
```

### 2. Добавление в корзину

```
User clicks "Add to cart"
    ↓
addItem() called from useCart hook
    ↓
Zustand store updates items[]
    ↓
localStorage updated (persist middleware)
    ↓
Component re-renders with new cart state
```

### 3. Оформление заказа

```
User fills checkout form
    ↓
Form validation with Zod
    ↓
User clicks "Confirm order"
    ↓
POST /api/orders with order data
    ↓
server/routes.ts validates input
    ↓
storage.createOrder() creates order in DB
    ↓
telegramService.sendToBot() sends notification
    ↓
Returns { orderNumber, telegramOrderId }
    ↓
Frontend opens Telegram bot link
    ↓
User confirms in bot
    ↓
Telegram webhook updates order status
```

### 4. Подтверждение заказа в Telegram

```
User opens bot link with deep link
    ↓
Telegram sends /start command with order ID
    ↓
telegramService.handleUpdate() processes update
    ↓
handleOrderConfirmation() fetches order from DB
    ↓
Sends message with confirmation buttons
    ↓
User clicks "Confirm"
    ↓
Telegram sends callback_query
    ↓
confirmOrder() updates order status in DB
    ↓
Sends notification to admin chat
    ↓
User sees confirmation message
```

---

## 📦 Слои приложения

### Frontend Layer (client/src/)

**Presentation Layer:**
- Pages: Страницы приложения
- Components: Переиспользуемые компоненты UI
- UI Components: shadcn/ui компоненты

**State Management:**
- Zustand: Локальное состояние (корзина)
- React Query: Кэширование данных с сервера

**API Communication:**
- Hooks: useProducts, useCart, useOrders, useReviews
- Fetch API: HTTP запросы

### Backend Layer (server/)

**API Layer:**
- routes.ts: Определение endpoints
- Валидация: Zod schemas
- Error handling: Обработка ошибок

**Business Logic Layer:**
- storage.ts: Работа с БД
- telegram.ts: Интеграция с Telegram

**Data Layer:**
- db.ts: SQLite подключение
- Drizzle ORM: Работа с таблицами

### Shared Layer (shared/)

**Type Definitions:**
- schema.ts: Drizzle таблицы + Zod схемы
- routes.ts: API контракт

---

## 🗄️ Структура БД

```
┌─────────────────────────────────────────────────────────┐
│                    SQLite Database                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │    products      │      │     reviews      │        │
│  ├──────────────────┤      ├──────────────────┤        │
│  │ id (PK)          │      │ id (PK)          │        │
│  │ slug (UNIQUE)    │      │ customerName     │        │
│  │ name             │      │ city             │        │
│  │ price            │      │ rating (1-5)     │        │
│  │ oldPrice         │      │ text             │        │
│  │ inStock          │      │ image            │        │
│  │ image            │      │ deliveryMethod   │        │
│  │ images (JSON)    │      │ createdAt        │        │
│  │ description      │      └──────────────────┘        │
│  │ specs (JSON)     │                                  │
│  │ popular          │      ┌──────────────────┐        │
│  │ createdAt        │      │     orders       │        │
│  └──────────────────┘      ├──────────────────┤        │
│           ↑                 │ id (PK)          │        │
│           │                 │ orderNumber      │        │
│           │                 │ customerName     │        │
│           │                 │ customerPhone    │        │
│           │                 │ customerEmail    │        │
│           │                 │ deliveryMethod   │        │
│           │                 │ city             │        │
│           │                 │ address          │        │
│           │                 │ apartment        │        │
│           │                 │ comment          │        │
│           │                 │ paymentMethod    │        │
│           │                 │ total            │        │
│           │                 │ status           │        │
│           │                 │ telegramOrderId  │        │
│           │                 │ telegramConfirmed│        │
│           │                 │ createdAt        │        │
│           │                 └──────────────────┘        │
│           │                         ↑                   │
│           │                         │ (1:N)            │
│           │                         │                   │
│           │                 ┌──────────────────┐        │
│           │                 │   orderItems     │        │
│           │                 ├──────────────────┤        │
│           │                 │ id (PK)          │        │
│           │                 │ orderId (FK)     │        │
│           │                 │ productId (FK)───┼────────┤
│           │                 │ quantity         │        │
│           │                 │ price            │        │
│           │                 └──────────────────┘        │
│           │                                             │
│           └─────────────────────────────────────────────┘
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Products API

```
GET /api/products
  Query: minPrice, maxPrice, inStock, sort, search
  Response: Product[]
  
GET /api/products/:slug
  Response: Product
  
GET /api/products/id/:id
  Response: Product
  
POST /api/products (admin)
  Body: InsertProduct
  Response: Product
  
PUT /api/products/:id (admin)
  Body: Partial<InsertProduct>
  Response: Product
  
DELETE /api/products/:id (admin)
  Response: 204 No Content
```

### Orders API

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

### Reviews API

```
GET /api/reviews
  Response: Review[]
  
POST /api/reviews
  Body: InsertReview
  Response: Review
```

### Telegram API

```
GET /api/test-telegram
  Response: {message: string}
  
GET /api/telegram-setup
  Response: {chatIds: number[], instructions: string[]}
  
POST /api/telegram/webhook
  Body: Telegram Update object
  Response: {ok: boolean}
```

---

## 🔐 Безопасность

### Frontend Security

```
┌─────────────────────────────────────────┐
│         React Application               │
├─────────────────────────────────────────┤
│ ✅ XSS Protection (React escapes HTML)  │
│ ✅ CSRF Protection (SameSite cookies)   │
│ ✅ Input Validation (Zod)               │
│ ✅ Type Safety (TypeScript)             │
│ ✅ Secure localStorage (cart data)      │
└─────────────────────────────────────────┘
```

### Backend Security

```
┌─────────────────────────────────────────┐
│         Express Server                  │
├─────────────────────────────────────────┤
│ ✅ Input Validation (Zod)               │
│ ✅ SQL Injection Protection (Drizzle)   │
│ ✅ Environment Variables (secrets)      │
│ ✅ HTTPS (production)                   │
│ ✅ Error Handling (no stack traces)     │
│ ✅ Type Safety (TypeScript)             │
└─────────────────────────────────────────┘
```

### Telegram Security

```
┌─────────────────────────────────────────┐
│      Telegram Bot Integration           │
├─────────────────────────────────────────┤
│ ✅ Token in Environment Variables       │
│ ✅ HTTPS for API calls                  │
│ ✅ Webhook Signature Verification       │
│ ✅ Rate Limiting (Telegram API)         │
│ ✅ Deep Link Validation                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Development

```
npm run dev
    ↓
Vite Dev Server (port 5000)
    ├─ Hot Module Replacement
    ├─ Source Maps
    └─ Fast Refresh
    
Express Dev Server
    ├─ Auto-reload on changes
    ├─ SQLite in ./data/
    └─ Telegram polling
```

### Production

```
Docker Container
    ↓
Node.js 20 Alpine
    ├─ npm start
    ├─ Express on port 5000
    ├─ SQLite in /app/data/
    └─ Telegram polling
    
Reverse Proxy (Coolify/Nginx)
    ├─ HTTPS
    ├─ Load Balancing
    └─ Static File Caching
```

---

## 📈 Performance Optimization

### Frontend

```
┌─────────────────────────────────────────┐
│      Performance Optimizations          │
├─────────────────────────────────────────┤
│ ✅ React Query Caching                  │
│ ✅ Code Splitting (Vite)                │
│ ✅ Lazy Loading Images                  │
│ ✅ Minification (production)            │
│ ✅ Tree Shaking                         │
│ ✅ Zustand for State (lightweight)      │
└─────────────────────────────────────────┘
```

### Backend

```
┌─────────────────────────────────────────┐
│      Performance Optimizations          │
├─────────────────────────────────────────┤
│ ✅ SQLite Indexes                       │
│ ✅ Query Optimization                   │
│ ✅ Connection Pooling                   │
│ ✅ Gzip Compression                     │
│ ✅ Caching Headers                      │
│ ✅ Efficient JSON Serialization         │
└─────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

### Global State (Zustand)

```
┌──────────────────────────────────────┐
│         useCart Hook                 │
├──────────────────────────────────────┤
│ State:                               │
│  - items: CartItem[]                 │
│  - totalPrice: () => number          │
│                                      │
│ Actions:                             │
│  - addItem(product, quantity)        │
│  - removeItem(productId)             │
│  - updateQuantity(productId, qty)    │
│  - clearCart()                       │
│                                      │
│ Persistence:                         │
│  - localStorage (cart-storage)       │
└──────────────────────────────────────┘
```

### Server State (React Query)

```
┌──────────────────────────────────────┐
│      useProducts Hook                │
├──────────────────────────────────────┤
│ Query Key: ['products', params]      │
│                                      │
│ Cache:                               │
│  - Automatic invalidation            │
│  - Stale time: 5 minutes             │
│  - Cache time: 10 minutes            │
│                                      │
│ Status:                              │
│  - isLoading                         │
│  - isError                           │
│  - data                              │
└──────────────────────────────────────┘
```

---

## 🔌 Integration Points

### Telegram Bot Integration

```
┌─────────────────────────────────────────┐
│      Order Created on Website           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   telegramService.sendToBot()           │
│   (sends order notification)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Telegram Bot API                      │
│   (https://api.telegram.org/bot...)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   User receives message in Telegram     │
│   with confirmation buttons             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   User clicks button                    │
│   (callback_query)                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Telegram sends update to bot          │
│   (via polling or webhook)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   telegramService.handleUpdate()        │
│   (processes confirmation)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   storage.confirmOrderByTelegramId()    │
│   (updates order status in DB)          │
└─────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
App
├── Router
│   ├── Home
│   │   ├── Layout
│   │   ├── ProductCard (multiple)
│   │   └── ReviewsCarousel
│   ├── Catalog
│   │   ├── Layout
│   │   ├── FilterContent
│   │   └── ProductCard (grid)
│   ├── ProductDetails
│   │   ├── Layout
│   │   ├── ProductCard (large)
│   │   └── ReviewsCarousel
│   ├── Cart
│   │   ├── Layout
│   │   └── CartItem (multiple)
│   ├── Checkout
│   │   ├── Layout
│   │   └── CheckoutForm
│   ├── Delivery
│   │   └── Layout
│   ├── Contacts
│   │   └── Layout
│   ├── Admin
│   │   └── Layout
│   └── NotFound
│
└── Providers
    ├── QueryClientProvider
    ├── TooltipProvider
    └── Toaster
```

---

## 🔄 Request/Response Cycle

### GET /api/products

```
Client Request
    ↓
Express Middleware (logging, parsing)
    ↓
Route Handler (server/routes.ts)
    ↓
Input Validation (Zod)
    ↓
Storage Query (server/storage.ts)
    ↓
Drizzle ORM Query
    ↓
SQLite Database
    ↓
Result Deserialization
    ↓
JSON Response
    ↓
React Query Cache
    ↓
Component Re-render
```

### POST /api/orders

```
Client Request (form data)
    ↓
Express Middleware (JSON parsing)
    ↓
Route Handler (server/routes.ts)
    ↓
Input Validation (Zod)
    ↓
Storage Create Order
    ├─ Validate products exist
    ├─ Calculate total
    ├─ Create order record
    └─ Create order items
    ↓
Telegram Notification
    ├─ Format message
    └─ Send to bot
    ↓
JSON Response (orderNumber, telegramOrderId)
    ↓
Frontend Redirect to Telegram
    ↓
User Confirmation in Bot
```

---

**Архитектура оптимизирована для масштабирования и поддержки!**
