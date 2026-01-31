import type { CreateOrderInput } from "@shared/routes";
import type { Product } from "@shared/schema";
import { storage } from "./storage";

export class TelegramService {
  private botToken: string;
  private chatId: string;
  private apiUrl: string;
  private botUsername: string;
  private isPolling: boolean = false;
  private pollingOffset: number = 0;

  constructor(botToken?: string, chatId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID || "";
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.botUsername = process.env.TELEGRAM_BOT_USERNAME || "parrot_shop_bot";

    if (!this.botToken) {
      console.warn(
        "⚠️  Telegram bot not configured. Set TELEGRAM_BOT_TOKEN in .env.local"
      );
    }
    if (!this.chatId) {
      console.warn(
        "⚠️  Telegram chat ID not configured. Set TELEGRAM_CHAT_ID in .env.local"
      );
    }
  }

  // Start long polling to receive updates
  startPolling() {
    if (this.isPolling || !this.botToken) {
      return;
    }

    this.isPolling = true;
    console.log("🤖 Telegram bot polling started");
    this.poll();
  }

  private async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(`${this.apiUrl}/getUpdates?offset=${this.pollingOffset}&timeout=30`);
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          this.pollingOffset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }

    // Continue polling
    setTimeout(() => this.poll(), 100);
  }

  stopPolling() {
    this.isPolling = false;
    console.log("🤖 Telegram bot polling stopped");
  }

  getBotLink(telegramOrderId?: string): string {
    if (telegramOrderId) {
      return `https://t.me/${this.botUsername}?start=${telegramOrderId}`;
    }
    return `https://t.me/${this.botUsername}`;
  }

  async sendToBot(text: string, chatId?: string): Promise<boolean> {
    if (!this.botToken) {
      console.warn("Telegram service not configured, skipping message");
      return false;
    }

    const targetChatId = chatId || this.chatId;
    if (!targetChatId) {
      console.warn("No chat ID provided");
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Telegram API error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      return false;
    }
  }

  async sendWithInlineKeyboard(
    text: string, 
    chatId: string, 
    buttons: { text: string, callback_data: string }[][]
  ): Promise<boolean> {
    if (!this.botToken) {
      console.warn("Telegram service not configured, skipping message");
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: buttons
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Telegram API error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      return false;
    }
  }

  async handleUpdate(update: any): Promise<void> {
    console.log('📨 Telegram update received:', JSON.stringify(update, null, 2));
    
    // Handle /start command with deep link
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const parts = text.split(' ');
      
      if (parts.length > 1) {
        // Deep link with order ID
        const telegramOrderId = parts[1];
        await this.handleOrderConfirmation(chatId, telegramOrderId);
      } else {
        // Regular /start
        await this.sendToBot(
          "👋 Добро пожаловать в магазин товаров для попугаев!\n\n" +
          "Здесь вы можете подтвердить свои заказы и общаться с нами.\n\n" +
          "Для подтверждения заказа перейдите по ссылке из письма или сайта.",
          chatId.toString()
        );
      }
      return;
    }

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      console.log('🔘 Callback query received:', update.callback_query.data);
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;

      if (callbackData.startsWith('confirm_')) {
        console.log('✅ Confirming order...');
        const telegramOrderId = callbackData.replace('confirm_', '');
        await this.confirmOrder(chatId, messageId, telegramOrderId);
      } else if (callbackData.startsWith('cancel_')) {
        console.log('❌ Cancelling order...');
        const telegramOrderId = callbackData.replace('cancel_', '');
        await this.cancelOrder(chatId, messageId, telegramOrderId);
      } else if (callbackData.startsWith('pay_card_')) {
        console.log('💳 Showing card payment form...');
        const telegramOrderId = callbackData.replace('pay_card_', '');
        await this.showCardPaymentForm(chatId, messageId, telegramOrderId);
      } else if (callbackData.startsWith('pay_qr_')) {
        console.log('📱 Showing QR payment...');
        const telegramOrderId = callbackData.replace('pay_qr_', '');
        await this.showQRPayment(chatId, messageId, telegramOrderId);
      } else if (callbackData.startsWith('send_payment_link_')) {
        console.log('🔗 Sending payment link...');
        const telegramOrderId = callbackData.replace('send_payment_link_', '');
        await this.sendPaymentLink(chatId, telegramOrderId);
      } else if (callbackData.startsWith('back_to_order_')) {
        console.log('◀️ Going back to order...');
        const telegramOrderId = callbackData.replace('back_to_order_', '');
        await this.handleOrderConfirmation(chatId, telegramOrderId);
      }

      // Answer callback query to remove loading state
      await fetch(`${this.apiUrl}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id
        }),
      });
      return;
    }

    // Handle regular messages
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      await this.sendToBot(
        "Спасибо за сообщение! Наш менеджер скоро с вами свяжется.\n\n" +
        "Для подтверждения заказа используйте ссылку из письма или сайта.",
        chatId.toString()
      );
    }
  }

  private async handleOrderConfirmation(chatId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.getOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot(
        "❌ Заказ не найден. Проверьте ссылку или обратитесь в поддержку.",
        chatId.toString()
      );
      return;
    }

    if (order.telegramConfirmed) {
      await this.sendToBot(
        `✅ Заказ #${order.orderNumber} уже подтвержден!\n\n` +
        `Статус: ${this.getStatusText(order.status)}\n` +
        `Сумма: ${order.total.toLocaleString('ru-RU')} ₽\n\n` +
        `Если у вас есть вопросы, напишите нам здесь.`,
        chatId.toString()
      );
      return;
    }

    const deliveryText = {
      pickup: "Самовывоз",
      courier: "Курьер",
      cdek: "CDEK",
      post: "Почта России",
    }[order.deliveryMethod] || order.deliveryMethod;

    const paymentText = {
      cash: "Наличные",
      card_online: "Карта онлайн",
      sbp: "СБП",
    }[order.paymentMethod] || order.paymentMethod;

    let address = "";
    if (order.deliveryMethod !== "pickup") {
      address = `\n📍 ${order.city || "—"}, ${order.address || "—"}${order.apartment ? `, кв. ${order.apartment}` : ""}`;
    }

    const message = 
      `🛒 <b>Заказ #${order.orderNumber}</b>\n\n` +
      `👤 ${order.customerName}\n` +
      `📱 ${order.customerPhone}\n` +
      `💰 ${order.total.toLocaleString('ru-RU')} ₽\n` +
      `🚚 ${deliveryText}${address}\n` +
      `💳 ${paymentText}\n\n` +
      `Подтвердите заказ, чтобы мы начали его обработку:`;

    // Показываем разные кнопки в зависимости от способа оплаты
    let buttons: { text: string, callback_data: string }[][];
    
    if (order.paymentMethod === 'card_online') {
      // Для онлайн-оплаты картой показываем кнопку оплаты
      buttons = [
        [{ text: "💳 Оплатить картой", callback_data: `pay_card_${telegramOrderId}` }],
        [{ text: "❌ Отменить заказ", callback_data: `cancel_${telegramOrderId}` }]
      ];
    } else if (order.paymentMethod === 'sbp') {
      // Для СБП показываем кнопку оплаты по QR
      buttons = [
        [{ text: "📱 Оплатить по QR-коду", callback_data: `pay_qr_${telegramOrderId}` }],
        [{ text: "❌ Отменить заказ", callback_data: `cancel_${telegramOrderId}` }]
      ];
    } else {
      // Для наличных просто подтверждение
      buttons = [
        [
          { text: "✅ Подтвердить заказ", callback_data: `confirm_${telegramOrderId}` },
          { text: "❌ Отменить", callback_data: `cancel_${telegramOrderId}` }
        ]
      ];
    }

    await this.sendWithInlineKeyboard(
      message,
      chatId.toString(),
      buttons
    );
  }

  private async confirmOrder(chatId: number, messageId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.confirmOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot("❌ Ошибка подтверждения заказа.", chatId.toString());
      return;
    }

    // Edit the message to show confirmation
    await fetch(`${this.apiUrl}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: 
          `✅ <b>Заказ #${order.orderNumber} подтвержден!</b>\n\n` +
          `Спасибо! Мы начали обработку вашего заказа.\n` +
          `Наш менеджер свяжется с вами для уточнения деталей.\n\n` +
          `Если у вас есть вопросы, пишите прямо сюда.`,
        parse_mode: "HTML"
      }),
    });

    // Notify admin chat
    if (this.chatId) {
      await this.sendToBot(
        `✅ <b>Заказ #${order.orderNumber} подтвержден клиентом!</b>\n\n` +
        `👤 ${order.customerName}\n` +
        `📱 ${order.customerPhone}`,
        this.chatId
      );
    }
  }

  private async cancelOrder(chatId: number, messageId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.getOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot("❌ Ошибка отмены заказа.", chatId.toString());
      return;
    }

    // Edit the message
    await fetch(`${this.apiUrl}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: 
          `❌ <b>Заказ #${order.orderNumber} отменен</b>\n\n` +
          `Если вы передумали, свяжитесь с нами:\n` +
          `📱 ${order.customerPhone}`,
        parse_mode: "HTML"
      }),
    });

    // Notify admin chat
    if (this.chatId) {
      await this.sendToBot(
        `❌ <b>Заказ #${order.orderNumber} отменен клиентом</b>\n\n` +
        `👤 ${order.customerName}\n` +
        `📱 ${order.customerPhone}`,
        this.chatId
      );
    }
  }

  private async showCardPaymentForm(chatId: number, messageId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.getOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot("❌ Ошибка загрузки заказа.", chatId.toString());
      return;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const paymentUrl = `${baseUrl}/payment.html?order=${order.orderNumber}&amount=${order.total}`;
    
    const message = 
      `💳 <b>Оплата картой</b>\n\n` +
      `Заказ: #${order.orderNumber}\n` +
      `Сумма: <b>${order.total.toLocaleString('ru-RU')} ₽</b>\n\n` +
      `┌─────────────────────────┐\n` +
      `│  ОПЛАТА БАНКОВСКОЙ КАРТОЙ  │\n` +
      `└─────────────────────────┘\n\n` +
      `Нажмите кнопку ниже чтобы получить ссылку на оплату\n\n` +
      `<i>Ваши данные защищены по стандарту PCI DSS</i>`;

    await fetch(`${this.apiUrl}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Получить ссылку на оплату", callback_data: `send_payment_link_${telegramOrderId}` }],
            [{ text: "◀️ Назад к заказу", callback_data: `back_to_order_${telegramOrderId}` }]
          ]
        }
      }),
    });
  }

  private async sendPaymentLink(chatId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.getOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot("❌ Ошибка загрузки заказа.", chatId.toString());
      return;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const paymentUrl = `${baseUrl}/payment.html?order=${order.orderNumber}&amount=${order.total}`;
    
    const message = 
      `💳 <b>Ссылка для оплаты заказа #${order.orderNumber}</b>\n\n` +
      `Сумма: <b>${order.total.toLocaleString('ru-RU')} ₽</b>\n\n` +
      `Откройте ссылку в браузере:\n` +
      `${paymentUrl}\n\n` +
      `После успешной оплаты заказ будет автоматически подтвержден.`;

    await this.sendToBot(message, chatId.toString());
  }

  private async showQRPayment(chatId: number, messageId: number, telegramOrderId: string): Promise<void> {
    const order = await storage.getOrderByTelegramId(telegramOrderId);
    
    if (!order) {
      await this.sendToBot("❌ Ошибка загрузки заказа.", chatId.toString());
      return;
    }

    // Генерируем QR-код для СБП (пока заглушка - используем placeholder)
    // В будущем здесь будет реальный QR от банка
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://sbp.example.com/pay/${telegramOrderId}`;
    
    const message = 
      `📱 <b>Оплата по QR-коду СБП</b>\n\n` +
      `Заказ: #${order.orderNumber}\n` +
      `Сумма: <b>${order.total.toLocaleString('ru-RU')} ₽</b>\n\n` +
      `┌─────────────────────────┐\n` +
      `│   СИСТЕМА БЫСТРЫХ ПЛАТЕЖЕЙ   │\n` +
      `└─────────────────────────┘\n\n` +
      `1️⃣ Откройте приложение вашего банка\n` +
      `2️⃣ Найдите раздел "Оплата по QR"\n` +
      `3️⃣ Наведите камеру на QR-код ниже\n` +
      `4️⃣ Подтвердите платеж\n\n` +
      `<i>После оплаты заказ будет автоматически подтвержден</i>`;

    // Сначала редактируем текст
    await fetch(`${this.apiUrl}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "◀️ Назад к заказу", callback_data: `back_to_order_${telegramOrderId}` }]
          ]
        }
      }),
    });

    // Затем отправляем QR-код отдельным сообщением
    await fetch(`${this.apiUrl}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: qrCodeUrl,
        caption: `QR-код для оплаты заказа #${order.orderNumber}\n\n💰 Сумма: ${order.total.toLocaleString('ru-RU')} ₽`,
        parse_mode: "HTML"
      }),
    });
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      new: "Новый",
      confirmed: "Подтвержден",
      processing: "В обработке",
      completed: "Выполнен",
      cancelled: "Отменен"
    };
    return statusMap[status] || status;
  }

  formatOrderMessage(
    orderNumber: string,
    input: CreateOrderInput,
    products: Map<number, Product>,
    total: number
  ): string {
    const itemsList = input.items
      .map((item) => {
        const product = products.get(item.productId);
        const productName = product?.name || `Product #${item.productId}`;
        const price = product?.price || 0;
        return `• ${productName} x${item.quantity} = ${(price * item.quantity).toLocaleString("ru-RU")} ₽`;
      })
      .join("\n");

    const deliveryText = {
      pickup: "Самовывоз",
      courier: "Курьер",
      cdek: "CDEK",
      post: "Почта России",
    }[input.deliveryMethod] || input.deliveryMethod;

    const paymentText = {
      cash: "Наличные",
      card_online: "Карта онлайн",
      sbp: "СБП",
    }[input.paymentMethod] || input.paymentMethod;

    let address = "";
    if (input.deliveryMethod !== "pickup") {
      address = `\n${input.city || "—"}, ${input.address || "—"}${input.apartment ? `, кв. ${input.apartment}` : ""}`;
    }

    const comment = input.comment ? `\n💬 ${input.comment}` : "";

    return `🛒 <b>Новая заявка #${orderNumber}</b>\n\n${itemsList}\n\n💰 ${total.toLocaleString("ru-RU")} ₽\n🚚 ${deliveryText}${address}\n💳 ${paymentText}\n\n📱 ${input.customerPhone}\n👤 ${input.customerName}${input.customerEmail ? `\n📧 ${input.customerEmail}` : ""}${comment}\n\n⚠️ Ожидает подтверждения клиента в боте`;
  }
}

export const telegramService = new TelegramService();
