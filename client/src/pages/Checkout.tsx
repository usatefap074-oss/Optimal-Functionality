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
import { Loader2, CheckCircle2 } from "lucide-react";

// Use the exact schema from routes/api
const schema = api.orders.create.input;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const [successData, setSuccessData] = useState<{ orderNumber: string } | null>(null);

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
    return (
      <Layout>
        <div className="container py-20 text-center max-w-lg mx-auto">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">Спасибо за заказ!</h1>
          <p className="text-xl mb-8">Номер вашего заказа: <span className="font-bold text-primary">{successData.orderNumber}</span></p>
          <p className="text-muted-foreground mb-8">
            Мы отправили подтверждение на вашу почту. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
          </p>
          <Button size="lg" onClick={() => setLocation("/")}>Вернуться на главную</Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: z.infer<typeof schema>) => {
    createOrder.mutate(data, {
      onSuccess: (res) => {
        clearCart();
        setSuccessData(res);
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
            <section className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
                Контактные данные
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя и Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Иванов" {...field} />
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
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+7 (999) 000-00-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (необязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="ivan@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* 2. Delivery */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</span>
                Способ получения
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="courier" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-1">Курьером по адресу</span>
                            <span className="block text-sm text-muted-foreground">Доставка до двери</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="pickup" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-1">Самовывоз</span>
                            <span className="block text-sm text-muted-foreground">г. Москва, ул. Попугаева 12</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="cdek" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-1">СДЭК</span>
                            <span className="block text-sm text-muted-foreground">До пункта выдачи</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="post" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            <span className="block font-bold mb-1">Почта России</span>
                            <span className="block text-sm text-muted-foreground">В отделение</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("deliveryMethod") !== 'pickup' && (
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город</FormLabel>
                        <FormControl>
                          <Input placeholder="Москва" {...field} />
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
                        <FormLabel>Улица, дом</FormLabel>
                        <FormControl>
                          <Input placeholder="ул. Ленина, д. 1" {...field} />
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
                        <FormLabel>Кв/Офис</FormLabel>
                        <FormControl>
                          <Input placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий к заказу</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Код домофона, пожелания по доставке..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* 3. Payment */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">3</span>
                Оплата
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
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                         <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="card_online" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1 font-bold">
                            Картой онлайн
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="sbp" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1 font-bold">
                            СБП
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                          <FormControl>
                            <RadioGroupItem value="cash" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1 font-bold">
                            При получении
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
            <div className="bg-muted/30 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border">
              <div>
                <p className="text-muted-foreground mb-1">Итого к оплате:</p>
                <p className="text-4xl font-bold text-primary">{totalPrice().toLocaleString()} ₽</p>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto px-12 text-lg h-14 shadow-xl shadow-primary/20"
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
