import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Phone, X, Search, Heart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const cartCount = useCart(state => state.totalItems());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/delivery", label: "Доставка" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* Top Bar */}
      <div className="bg-primary/5 text-xs py-2 hidden md:block border-b border-primary/10">
        <div className="container flex justify-between items-center text-muted-foreground">
          <p>Интернет-зоомагазин "Золотой Какаду"</p>
          <div className="flex gap-4">
            <a href="tel:+79181817775" className="hover:text-primary transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" />
              +7 (918) 181-77-75
            </a>
            <span className="text-gray-300">|</span>
            <span>Ежедневно с 9:00 до 21:00</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="flex flex-col gap-8 mt-8">
                <Link href="/" className="font-display text-2xl font-bold text-primary">
                  🦜 Золотой Какаду
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`text-lg font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/80'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Свяжитесь с нами:</p>
                  <a href="tel:+79181817775" className="text-lg font-bold block mb-4">+7 (918) 181-77-75</a>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="font-display text-2xl md:text-3xl font-bold text-primary hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <span className="text-3xl">🦜</span>
            <span className="hidden sm:inline">Золотой Какаду</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 mx-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/70'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Toggle */}
            <div className={`relative transition-all duration-300 ${isSearchOpen ? 'w-full absolute inset-x-0 top-0 h-20 bg-background flex items-center px-4 z-50' : ''}`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="w-full container flex items-center gap-2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input 
                    autoFocus
                    placeholder="Поиск товаров..." 
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/70 hover:text-primary">
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            {!isSearchOpen && (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-primary">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[10px]">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-[#1a1a1a] text-white pt-20 pb-10">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-bold font-display text-primary">Золотой Какаду</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Эксперты в мире птиц с 2014 года. Мы знаем, что нужно вашим пернатым друзьям. Тысячи довольных клиентов по всей России.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/20 text-gray-400 px-2 py-0.5">10 лет на рынке</Badge>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-gray-400 px-2 py-0.5">Гарантия качества</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-0">
            <div className="mb-0 md:mb-12">
              <h4 className="font-bold mb-6 text-lg">Каталог</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/catalog?category=feed" className="hover:text-primary transition-colors">Корма</Link></li>
                <li><Link href="/catalog?category=cages" className="hover:text-primary transition-colors">Клетки</Link></li>
                <li><Link href="/catalog?category=toys" className="hover:text-primary transition-colors">Игрушки</Link></li>
                <li><Link href="/catalog?category=vet" className="hover:text-primary transition-colors">Вет. аптека</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg">Покупателям</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/delivery" className="hover:text-primary transition-colors">Доставка и оплата</Link></li>
                <li><Link href="/contacts" className="hover:text-primary transition-colors">Контакты</Link></li>
                <li><Link href="/catalog" className="hover:text-primary transition-colors">Акции</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Контакты</h4>
            <ul className="space-y-6 text-sm text-gray-400 flex flex-col items-center md:items-start">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Бесплатный звонок</p>
                  <a href="tel:+79181817775" className="text-lg font-bold text-white hover:text-primary transition-colors">+7 (918) 181-77-75</a>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all">
                  <div className="text-xs font-bold text-center w-full">WA</div>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0088cc]/20 rounded-full flex items-center justify-center text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-all">
                  <div className="text-xs font-bold text-center w-full">TG</div>
                </a>
              </li>
              <li className="text-xs text-gray-600 mt-4 leading-relaxed text-center md:text-left">
                ИП Иванов И.И. | ОГРНИП 3123123123123<br/>
                Краснодар, Уральская 7
              </li>
            </ul>
          </div>
          
          <div className="hidden md:block">
            <h4 className="font-bold mb-6 text-lg">Принимаем к оплате</h4>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold">VISA</div>
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold">MIR</div>
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold">MASTERCARD</div>
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold">SBP</div>
            </div>
          </div>
        </div>
        <div className="container border-t border-gray-800/50 pt-10 text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Золотой Какаду. Все права защищены. Сделано с любовью к птицам.</p>
        </div>
      </footer>
    </div>
  );
}
