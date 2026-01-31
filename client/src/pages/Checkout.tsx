import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2, MessageCircle } from "lucide-react";

// Use the exact schema from routes/api
const schema = api.orders.create.input;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const [successData, setSuccessData] = useState<{ orderNumber: string, telegramOrderId: string } | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryMethod: "courier",
      paymentMethod: "card_online",
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      customerEmail: "",
    }
  });

  if (successData) {
    const botUsername = "papugasik_bot";
    const telegramLink = `https://t.me/${botUsername}?start=${successData.telegramOrderId}`;
    
    return (
      <Layout>
        <div className="container py-20 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">Спасибо за заказ!</h1>
          <p className="text-xl mb-8">Номер вашего заказа: <span className="font-bold text-primary">{successData.orderNumber}</span></p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-900">Подтвердите заказ в Telegram</h2>
            </div>
            <p className="text-blue-800 mb-6">
              Для завершения оформления перейдите в наш Telegram-бот и подтвердите заказ. 
              Там же вы сможете отслеживать статус и общаться с менеджером.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto shadow-xl"
              onClick={() => window.open(telegramLink, '_blank')}
            >
              <MessageCircle className="mr-2 h-6 w-6" />
              Открыть Telegram-бот
            </Button>
            <p className="text-sm text-blue-600 mt-4">
              Или скопируйте ссылку: <code className="bg-white px-2 py-1 rounded text-xs">{telegramLink}</code>
            </p>
          </div>

          <p className="text-muted-foreground mb-8">
            Мы также отправили подтверждение на вашу почту. Наш менеджер свяжется с вами после подтверждения в боте.
          </p>
          <Button size="lg" variant="outline" onClick={() => setLocation("/")}>Вернуться на главную</Button>
        </div>
      </Layout>
    );
  }

  // MOVED THIS CHECK AFTER successData check!
  if (items.length === 0 && !successData) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log('Submitting order...', data);
    createOrder.mutate(data, {
      onSuccess: (res) => {
        console.log('Order success:', res);
        clearCart();
        
        // Автоматически открываем Telegram
        const botUsername = "papugasik_bot";
        const telegramLink = `https://t.me/${botUsername}?start=${res.telegramOrderId}`;
        window.open(telegramLink, '_blank');
        
        // Показываем страницу успеха
        setSuccessData(res);
      },
      onError: (error) => {
        console.error('Order error:', error);
      }
    });
  };

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">Оформление заказа</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. Contact Info */}
            <section className="bg-card p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs md:text-sm shrink-0">1</span>
                <span>Контактные данные</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Имя и Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Иванов" className="h-11 md:h-10 text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+7 (999) 000-00-00" className="h-11 md:h-10 text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm md:text-base">Email (необязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="ivan@example.com" className="h-11 md:h-10 text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* 2. Delivery */}
            <section className="bg-card p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs md:text-sm shrink-0">2</span>
                <span>Способ получения</span>
              </h2>
              
              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="courier" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-0.5 text-sm md:text-base">Курьером по адресу</span>
                            <span className="block text-xs md:text-sm text-muted-foreground">Доставка до двери</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="pickup" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-0.5 text-sm md:text-base">Самовывоз</span>
                            <span className="block text-xs md:text-sm text-muted-foreground">г. Москва, ул. Попугаева 12</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="cdek" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-0.5 text-sm md:text-base">СДЭК</span>
                            <span className="block text-xs md:text-sm text-muted-foreground">До пункта выдачи</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="post" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-0.5 text-sm md:text-base">Почта России</span>
                            <span className="block text-xs md:text-sm text-muted-foreground">В отделение</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("deliveryMethod") !== 'pickup' && (
                <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Город</FormLabel>
                        <FormControl>
                          <Input placeholder="Москва" className="h-11 md:h-10 text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Улица, дом</FormLabel>
                        <FormControl>
                          <Input placeholder="ул. Ленина, д. 1" className="h-11 md:h-10 text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Кв/Офис</FormLabel>
                        <FormControl>
                          <Input placeholder="15" className="h-11 md:h-10 text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="mt-4 md:mt-6">
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Комментарий к заказу</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Код домофона, пожелания по доставке..." className="min-h-[80px] text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* 3. Payment */}
            <section className="bg-card p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs md:text-sm shrink-0">3</span>
                <span>Оплата</span>
              </h2>
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
                      >
                         <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="card_online" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1 font-bold text-sm md:text-base">
                            Картой онлайн
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 md:p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5 touch-manipulation">
                          <FormControl>
                            <RadioGroupItem value="sbp" className="shrink-0" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1 font-bold text-sm md:text-base">
                            СБП
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Summary & Submit */}
            <div className="bg-muted/30 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 border">
              <div className="text-center md:text-left">
                <p className="text-sm md:text-base text-muted-foreground mb-1">Итого к оплате:</p>
                <p className="text-3xl md:text-4xl font-bold text-primary">{totalPrice().toLocaleString()} ₽</p>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto px-8 md:px-12 text-base md:text-lg h-12 md:h-14 shadow-xl shadow-primary/20"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Оформляем...
                  </>
                ) : (
                  "Подтвердить заказ"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
