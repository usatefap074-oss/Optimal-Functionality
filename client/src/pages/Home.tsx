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
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 py-12 md:py-24">
        <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
              Все лучшее для<br />
              <span className="text-primary">вашего попугая</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
              Корма премиум-класса, просторные клетки, развивающие игрушки и витамины.
              Доставка по всей России!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/catalog">
                <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-xl hover:shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1">
                  В каталог <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            {/* Abstract blobs background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/40 blur-3xl rounded-full" />
            
            {/* Hero Image */}
            <img 
              src="https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&q=80&w=800" 
              alt="Happy Parrot" 
              className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Категории товаров</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`}>
                <div className="group cursor-pointer">
                  <div className={`rounded-2xl overflow-hidden aspect-square mb-4 ${cat.color} p-4 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl shadow-inner mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="text-center font-bold text-lg group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-bold">Популярное</h2>
            <Link href="/catalog">
              <Button variant="link" className="text-primary">Смотреть все</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative">
              <Carousel 
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {popularProducts?.slice(0, 8).map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-orange-50 border border-orange-100">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Широкий ассортимент</h3>
              <p className="text-sm text-muted-foreground">Более 1000 товаров для всех видов попугаев</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-green-50 border border-green-100">
              <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Быстрая доставка</h3>
              <p className="text-sm text-muted-foreground">Доставляем по всей России. Бесплатно от 5000₽</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Гарантия качества</h3>
              <p className="text-sm text-muted-foreground">Только сертифицированные товары от проверенных брендов</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-pink-50 border border-pink-100">
              <div className="w-12 h-12 bg-pink-500/20 text-pink-600 rounded-full flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Помощь экспертов</h3>
              <p className="text-sm text-muted-foreground">Бесплатная консультация по уходу и содержанию</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
