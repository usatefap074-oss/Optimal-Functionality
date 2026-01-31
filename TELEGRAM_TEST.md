# Тестирование Telegram-бота

## Быстрый тест

1. **Запустите сервер:**
   ```bash
   npm run dev
   ```

2. **Откройте сайт:** http://localhost:5000

3. **Создайте тестовый заказ:**
   - Добавьте товары в корзину
   - Перейдите в корзину
   - Нажмите "Оформить заказ"
   - Заполните форму
   - Подтвердите заказ

4. **Проверьте результат:**
   - Вы увидите страницу успеха с кнопкой "Открыть Telegram-бот"
   - Нажмите на кнопку или скопируйте ссылку
   - Откроется Telegram с вашим ботом

5. **В Telegram:**
   - Бот покажет детали заказа
   - Нажмите "✅ Подтвердить заказ"
   - Заказ будет подтвержден
   - Менеджер получит уведомление (если настроен TELEGRAM_CHAT_ID)

## Что должно работать

### ✅ После создания заказа:
- Страница успеха показывает номер заказа
- Отображается синяя карточка с кнопкой Telegram
- Ссылка содержит уникальный ID заказа

### ✅ В Telegram-боте:
- `/start` - приветствие
- `/start ORDER_ID` - показывает детали заказа
- Кнопки "Подтвердить" и "Отменить"
- После подтверждения статус меняется на "confirmed"

### ✅ Уведомления:
- Админ получает уведомление о новом заказе
- Админ получает уведомление о подтверждении

## Проверка базы данных

```bash
# Проверить, что заказ создан
sqlite3 data/parrot_shop.db "SELECT * FROM orders ORDER BY id DESC LIMIT 1;"

# Проверить telegramOrderId
sqlite3 data/parrot_shop.db "SELECT orderNumber, telegramOrderId, telegramConfirmed, status FROM orders ORDER BY id DESC LIMIT 1;"
```

## Troubleshooting

### Ошибка "telegramOrderId undefined"
- Убедитесь, что база данных обновлена: `npm run db:push`
- Перезапустите сервер

### Бот не отвечает
- Проверьте TELEGRAM_BOT_TOKEN в .env.local
- Убедитесь, что бот не заблокирован
- Проверьте username бота в TELEGRAM_BOT_USERNAME

### Кнопка не работает
- Проверьте консоль браузера на ошибки
- Убедитесь, что telegramOrderId возвращается с сервера

### Уведомления не приходят
- Проверьте TELEGRAM_CHAT_ID
- Отправьте `/start` боту
- Проверьте: http://localhost:5000/api/telegram-setup

## API для тестирования

```bash
# Тест уведомлений
curl http://localhost:5000/api/test-telegram

# Получить Chat ID
curl http://localhost:5000/api/telegram-setup

# Создать тестовый заказ (через Postman или curl)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Тест",
    "customerPhone": "+7 999 123 45 67",
    "deliveryMethod": "courier",
    "city": "Москва",
    "address": "ул. Тестовая, 1",
    "paymentMethod": "card_online",
    "items": [{"productId": 1, "quantity": 1}]
  }'
```

## Ожидаемый результат

После успешного теста:
1. ✅ Заказ создан в базе данных
2. ✅ telegramOrderId сгенерирован
3. ✅ Ссылка на бота работает
4. ✅ Бот показывает детали заказа
5. ✅ Подтверждение обновляет статус
6. ✅ Админ получает уведомления
7. ✅ Можно общаться с ботом
