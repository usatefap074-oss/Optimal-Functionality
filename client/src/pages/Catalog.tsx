import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useProducts, useCategories } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";

export default function Catalog() {
  const [location] = useLocation();
  
  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || undefined;
  const initialSearch = searchParams.get("search") || undefined;

  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState(initialSearch);

  // Sync state with URL params when they change externally
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") || undefined);
    setSearch(params.get("search") || undefined);
  }, [location]);

  const { data: products, isLoading } = useProducts({
    category,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    inStock: inStock ? true : undefined,
    sort: sort as any,
    search,
  });

  const { data: categories } = useCategories();

  const handleClearFilters = () => {
    setCategory(undefined);
    setPriceRange([0, 10000]);
    setInStock(false);
    setSearch(undefined);
    setSort("popular");
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold mb-4">Категории</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all" 
              checked={!category}
              onCheckedChange={() => setCategory(undefined)}
            />
            <Label htmlFor="all" className="cursor-pointer">Все товары</Label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox 
                id={cat.id} 
                checked={category === cat.id}
                onCheckedChange={() => setCategory(cat.id)}
              />
              <Label htmlFor={cat.id} className="cursor-pointer">{cat.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Цена</h3>
        <Slider
          defaultValue={[0, 10000]}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center gap-4">
          <Input 
            type="number" 
            value={priceRange[0]} 
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="h-9"
          />
          <span>-</span>
          <Input 
            type="number" 
            value={priceRange[1]} 
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="h-9"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="instock" 
            checked={inStock}
            onCheckedChange={(checked) => setInStock(checked as boolean)}
          />
          <Label htmlFor="instock" className="cursor-pointer font-medium">Только в наличии</Label>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleClearFilters}>
        Сбросить фильтры
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar - Desktop */}
          <aside className="w-64 hidden md:block shrink-0">
            <FilterContent />
          </aside>

          <div className="flex-1">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold">Каталог товаров</h1>
                <p className="text-muted-foreground mt-1">
                  {products?.length || 0} товаров найдено
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden flex-1">
                      <Filter className="w-4 h-4 mr-2" /> Фильтры
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="py-4">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">По популярности</SelectItem>
                    <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                    <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                    <SelectItem value="name">По названию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(category || inStock || priceRange[0] > 0 || priceRange[1] < 10000 || search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <Button variant="secondary" size="sm" onClick={() => setSearch(undefined)} className="h-7 text-xs">
                    Поиск: {search} <X className="ml-1 w-3 h-3" />
                  </Button>
                )}
                {category && (
                  <Button variant="secondary" size="sm" onClick={() => setCategory(undefined)} className="h-7 text-xs">
                    Категория: {categories?.find(c => c.id === category)?.name || category} <X className="ml-1 w-3 h-3" />
                  </Button>
                )}
                {inStock && (
                  <Button variant="secondary" size="sm" onClick={() => setInStock(false)} className="h-7 text-xs">
                    В наличии <X className="ml-1 w-3 h-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-2xl">
                <p className="text-xl font-medium text-muted-foreground mb-4">Товары не найдены</p>
                <Button onClick={handleClearFilters}>Сбросить все фильтры</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
