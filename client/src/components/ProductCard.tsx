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
          src={product.image && product.image.trim() !== "" ? product.image : "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80"}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80";
          }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 text-sm font-medium rounded-full">Нет в наличии</span>
          </div>
        )}
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="text-[10px] md:text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          Попугай
        </div>
        
        <Link href={`/product/${product.slug}`} className="font-display font-semibold text-sm md:text-lg leading-tight mb-2 hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
          {product.name}
        </Link>
        
        <div className="mt-auto pt-3 md:pt-4 flex items-end justify-between gap-2 md:gap-4">
          <div>
            {product.oldPrice && (
              <div className="text-xs md:text-sm text-muted-foreground line-through decoration-red-400 decoration-2">
                {product.oldPrice.toLocaleString()} ₽
              </div>
            )}
            <div className="text-base md:text-xl font-bold text-foreground">
              {product.price.toLocaleString()} ₽
            </div>
          </div>
          
          <Button
            size="icon"
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            className={`rounded-full shadow-lg transition-all duration-300 h-9 w-9 md:h-10 md:w-10 shrink-0 ${
              inCart 
                ? "bg-secondary hover:bg-secondary/90 text-white" 
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {inCart ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
