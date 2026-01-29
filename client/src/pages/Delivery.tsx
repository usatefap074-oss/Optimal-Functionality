import { Layout } from "@/components/Layout";
import { Truck, Clock, MapPin, CreditCard } from "lucide-react";

export default function Delivery() {
  return (
    <Layout>
      <div className="container py-12 md:py-16 max-w-4xl">
        <h1 className="text-4xl font-display font-bold mb-8">Доставка и оплата</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
            <Truck className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Способы доставки</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <span className="font-bold block">Курьером по Москве</span>
                  <span className="text-muted-foreground">350₽ (бесплатно от 5000₽)</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <span className="font-bold block">СДЭК по России</span>
                  <span className="text-muted-foreground">От 250₽, срок от 2 дней</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <span className="font-bold block">Почта России</span>
                  <span className="text-muted-foreground">От 200₽, срок от 5 дней</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <div>
                  <span className="font-bold block">Самовывоз</span>
                  <span className="text-muted-foreground">Бесплатно. Москва, ул. Попугаева 12</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
            <CreditCard className="w-12 h-12 text-green-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Способы оплаты</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <span className="font-bold block">Банковской картой онлайн</span>
                  <span className="text-muted-foreground">Visa, Mastercard, МИР</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <span className="font-bold block">СБП (Система быстрых платежей)</span>
                  <span className="text-muted-foreground">По QR-коду без комиссии</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <span className="font-bold block">Наличными или картой при получении</span>
                  <span className="text-muted-foreground">Курьеру или в пункте выдачи</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-primary" /> Сроки обработки заказов
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Заказы, оформленные до 14:00, передаются в службу доставки в тот же день. 
              Заказы, оформленные после 14:00, отправляются на следующий рабочий день.
              Мы работаем ежедневно с 9:00 до 21:00.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-primary" /> География доставки
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Мы доставляем товары по всей территории Российской Федерации. В удаленные регионы сроки могут быть увеличены.
              При оформлении заказа вы увидите точную стоимость и сроки для вашего города.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
