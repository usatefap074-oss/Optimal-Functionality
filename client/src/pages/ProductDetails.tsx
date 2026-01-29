import { useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, Truck, Shield, Check } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // Fetch related products
  const { data: relatedProducts } = useProducts({ 
    category: product?.category, 
    // In a real app we'd filter out the current product ID
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse w-3/4 rounded" />
              <div className="h-4 bg-muted animate-pulse w-1/4 rounded" />
              <div className="h-24 bg-muted animate-pulse w-full rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Товар не найден</h1>
          <p className="text-muted-foreground">Возможно он был удален или ссылка неверна.</p>
        </div>
      </Layout>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];
  const currentImage = mainImage || images[0];
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-border/50 relative">
              <img 
                src={currentImage} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-lg py-1 px-3">-{discount}%</Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${currentImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm text-primary font-bold uppercase tracking-wider mb-2">
                {product.category === 'feed' ? 'Корм' : 
                 product.category === 'cages' ? 'Клетки' :
                 product.category === 'toys' ? 'Игрушки' : 'Вет. аптека'}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </div>
                {product.popular && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    Хит продаж
                  </div>
                )}
              </div>

              <div className="flex items-end gap-4 mb-8">
                <div className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString()} ₽
                </div>
                {product.oldPrice && (
                  <div className="text-xl text-muted-foreground line-through mb-1">
                    {product.oldPrice.toLocaleString()} ₽
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl mb-8 border border-border/50">
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center rounded-lg border bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1 text-lg h-12 shadow-lg shadow-primary/20"
                  disabled={!product.inStock}
                  onClick={() => addItem(product, quantity)}
                >
                  <ShoppingCart className="mr-2 w-5 h-5" /> Добавить в корзину
                </Button>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Доставка по Москве завтра, по России от 2 дней</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Гарантия возврата в течение 14 дней</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Товар сертифицирован</span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm text-muted-foreground">
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="mb-8 w-full justify-start border-b rounded-none h-auto bg-transparent p-0">
              <TabsTrigger 
                value="specs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6 text-lg"
              >
                Характеристики
              </TabsTrigger>
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-6 text-lg"
              >
                Описание
              </TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-0">
              <div className="bg-white rounded-2xl border p-6 md:p-8">
                <dl className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="flex justify-between border-b border-dashed pb-2">
                      <dt className="text-muted-foreground">{spec.key}</dt>
                      <dd className="font-medium text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TabsContent>
            <TabsContent value="description" className="mt-0">
              <div className="bg-white rounded-2xl border p-6 md:p-8 prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 1 && (
          <section>
            <h2 className="text-2xl font-bold font-display mb-8">Вам может понравиться</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
