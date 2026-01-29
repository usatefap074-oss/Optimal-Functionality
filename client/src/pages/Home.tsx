import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Package } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: 'feed', name: 'Корма', image: 'https://images.unsplash.com/photo-1615818499660-30bb528825c2?auto=format&fit=crop&q=80&w=400', color: 'bg-orange-100' },
  { id: 'cages', name: 'Клетки', image: 'https://images.unsplash.com/photo-1555663731-0cb8651a5c2d?auto=format&fit=crop&q=80&w=400', color: 'bg-blue-100' },
  { id: 'toys', name: 'Игрушки', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=400', color: 'bg-pink-100' },
  { id: 'vet', name: 'Аптека', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400', color: 'bg-green-100' },
];

export default function Home() {
  const { data: popularProducts, isLoading } = useProducts({ sort: 'popular' });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100/50 py-16 md:py-28">
        <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5 rounded-full">
                Золотой Какаду — Эксперты с 2014 года
              </Badge>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-bold text-foreground leading-[1.1]">
              Ваш попугай заслуживает <span className="text-primary italic relative inline-block">лучшего<span className="absolute bottom-1 left-0 w-full h-3 bg-primary/10 -z-10 -rotate-1"></span></span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
              Премиальные корма, уютные клетки и развивающие игрушки с бережной доставкой по всей России.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/catalog">
                <Button size="lg" className="rounded-full text-lg px-10 py-7 shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Перейти в каталог <ArrowRight className="ml-2 w-6 h-6" />
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

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Популярные разделы</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Все необходимое для вашего пернатого друга в одном месте</p>
            </div>
            <Link href="/catalog" className="mx-auto md:mx-0">
              <Button variant="ghost" className="group text-primary hover:text-primary hover:bg-primary/5 px-6">
                Весь каталог <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`}>
                <div className={`group cursor-pointer relative overflow-hidden rounded-2xl md:rounded-3xl ${cat.color} aspect-[4/5] p-4 md:p-8 flex flex-col justify-end transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}>
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 mix-blend-multiply"
                  />
                  <div className="relative z-10 space-y-1 md:space-y-2">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] md:text-sm font-medium text-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                      Смотреть товары →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Хиты продаж</h2>
            <p className="text-muted-foreground text-lg">То, что больше всего нравится нашим покупателям</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-white animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative px-2">
              <Carousel 
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 md:-ml-8">
                  {popularProducts?.slice(0, 8).map((product) => (
                    <CarouselItem key={product.id} className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/4">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-12 md:hidden">
                  <CarouselPrevious className="relative inset-0" />
                  <CarouselNext className="relative inset-0" />
                </div>
                <CarouselPrevious className="hidden md:flex -left-6 lg:-left-12 h-12 w-12" />
                <CarouselNext className="hidden md:flex -right-6 lg:-right-12 h-12 w-12" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Почему нам доверяют</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Мы занимаемся птицами уже более 10 лет и знаем, как сделать их жизнь счастливой.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-orange-50 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 text-primary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 rotate-3">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">10+ лет опыта</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Эксперты с 2014 года. Мы знаем о птицах всё.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-green-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/20 text-secondary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 -rotate-3">
                <Truck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Безопасная доставка</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Бережная упаковка и страховка по всей РФ.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-blue-50 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 rotate-6">
                <Package className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Только оригинал</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Прямые поставки. 100% гарантия качества.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-8 rounded-2xl md:rounded-[2rem] bg-pink-50 border border-pink-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500/20 text-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 -rotate-6">
                <HeartHandshake className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">Забота о вас</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Профессиональные консультации на каждом этапе.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
      </section>
    </Layout>
  );
}
