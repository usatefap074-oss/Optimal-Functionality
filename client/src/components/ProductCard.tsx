import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.product.id === product.id);

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-xl border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <Badge className="bg-red-500 hover:bg-red-600">-{discount}%</Badge>
        )}
        {product.popular && (
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-none">Хит</Badge>
        )}
      </div>

      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image || "https://placehold.co/400x400/png?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 text-sm font-medium rounded-full">Нет в наличии</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          {product.category === 'feed' ? 'Корм' : 
           product.category === 'cages' ? 'Клетки' :
           product.category === 'toys' ? 'Игрушки' : 'Вет. аптека'}
        </div>
        
        <Link href={`/product/${product.slug}`} className="font-display font-semibold text-lg leading-tight mb-2 hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </Link>
        
        <div className="mt-auto pt-4 flex items-end justify-between gap-4">
          <div>
            {product.oldPrice && (
              <div className="text-sm text-muted-foreground line-through decoration-red-400 decoration-2">
                {product.oldPrice.toLocaleString()} ₽
              </div>
            )}
            <div className="text-xl font-bold text-foreground">
              {product.price.toLocaleString()} ₽
            </div>
          </div>
          
          <Button
            size="icon"
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            className={`rounded-full shadow-lg transition-all duration-300 ${
              inCart 
                ? "bg-secondary hover:bg-secondary/90 text-white" 
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {inCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
