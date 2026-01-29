import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const [, setLocation] = useLocation();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🦜</span>
          </div>
          <h1 className="text-3xl font-bold font-display mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-8">
            Вашему попугаю наверняка что-то нужно. Загляните в каталог!
          </p>
          <Link href="/catalog">
            <Button size="lg" className="w-full">Перейти в каталог</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-display font-bold mb-8">Корзина</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div 
                key={product.id} 
                className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/product/${product.slug}`} className="shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${product.slug}`} className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <button 
                      onClick={() => removeItem(product.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border rounded-lg bg-background">
                      <button 
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-2 hover:bg-muted rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-2 hover:bg-muted rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-lg font-bold">
                      {(product.price * quantity).toLocaleString()} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-bold font-display mb-6">Ваш заказ</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Товары ({totalItems()})</span>
                  <span>{total.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Скидка</span>
                  <span>-0 ₽</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold">Итого</span>
                <span className="text-2xl font-bold text-primary">{total.toLocaleString()} ₽</span>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg h-12 shadow-lg shadow-primary/25"
                onClick={() => setLocation("/checkout")}
              >
                Оформить заказ <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
