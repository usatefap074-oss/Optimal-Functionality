import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/use-products";
import { useReviews } from "@/hooks/use-reviews";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

// Категории больше не нужны - только попугаи

export default function Home() {
  const { data: popularProducts = [], isLoading, error } = useProducts({ sort: 'popular' });
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();

  console.log('Home page - popularProducts:', popularProducts?.length, 'loading:', isLoading, 'error:', error);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100/50 py-16 md:py-28">
        <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5 rounded-full">
                Золотой Какаду — Разводим попугаев с 1995 года
              </Badge>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-bold text-foreground leading-[1.1]">
              Эксклюзивные <span className="text-primary italic relative inline-block">попугаи<span className="absolute bottom-1 left-0 w-full h-3 bg-primary/10 -z-10 -rotate-1"></span></span> от профессионалов
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
              Мы специализируемся только на попугаях. Более 30 лет опыта разведения, прямые поставки от проверенных питомников и собственное производство.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/catalog">
                <Button size="lg" className="rounded-full text-lg px-10 py-7 shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Выбрать попугая <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Link href="/delivery">
                <Button size="lg" variant="outline" className="rounded-full text-lg px-10 py-7 border-2">
                  Доставка
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative group hidden md:block">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            <div className="relative p-4 md:p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&q=80&w=800" 
                alt="Попугай" 
                className="relative rounded-[1.5rem] object-cover aspect-[4/3] w-full"
              />
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 bg-white p-4 md:p-6 rounded-3xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Безопасно</p>
                  <p className="font-bold text-sm">Гарантия 100%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden mt-8">
            <img 
              src="https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&q=80&w=800" 
              alt="Попугай" 
              className="rounded-3xl shadow-xl object-cover aspect-[4/3] w-full"
            />
          </div>
        </div>
      </section>



      {/* Popular Products */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Популярные породы</h2>
            <p className="text-muted-foreground text-lg">Самые востребованные попугаи из нашей коллекции</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-white animate-pulse" />
              ))}
            </div>
          ) : popularProducts && popularProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {popularProducts.slice(0, 8).map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">Товары не найдены</div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Почему мы лучшие</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Три десятилетия опыта разведения попугаев. Мы знаем о них абсолютно всё.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-orange-50 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 text-primary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 rotate-3">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">30+ лет опыта</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Разводим попугаев с 1995 года. Настоящие профессионалы своего дела.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-green-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/20 text-secondary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 -rotate-3">
                <Truck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Прямые поставки</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Работаем напрямую с лучшими питомниками мира. Никаких посредников.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-blue-50 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 rotate-6">
                <Package className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Эксклюзивные породы</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Редкие виды, которых не найти в обычных магазинах.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-pink-50 border border-pink-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500/20 text-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 -rotate-6">
                <HeartHandshake className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Только попугаи</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Узкая специализация — наша сила. Мы эксперты именно в попугаях.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-b from-background to-orange-50/30">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Отзывы наших клиентов</h2>
            <p className="text-muted-foreground text-lg">Реальные истории от людей, которые уже получили своих попугаев</p>
          </div>

          <ReviewsCarousel reviews={reviews} isLoading={reviewsLoading} />
        </div>
      </section>
    </Layout>
  );
}
