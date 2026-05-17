import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { MobileMenu } from "@/components/MobileMenu";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center tracking-wide font-medium">
        شحن مجاني للطلبات فوق 200 ر.س • تسوق الآن
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
                        <MobileMenu />

            {/* <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="text-lg font-bold mb-6">القائمة</SheetTitle>
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-bold">الرئيسية</Link>
                  <Link href="/products" className="text-lg font-bold">المنتجات</Link>
                  <Link href="/categories" className="text-lg font-bold">الأقسام</Link>
                  <Link href="/about" className="text-lg font-bold">من نحن</Link>
                  <Link href="/contact" className="text-lg font-bold">اتصل بنا</Link>
                </nav>
              </SheetContent>
            </Sheet> */}

            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary tracking-tight">متجر لمسات مول</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
            <Link href="/about" className="hover:text-primary transition-colors">من نحن</Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 rounded-full bg-muted/50 border-none focus-visible:ring-1"
              />
            </form>

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSearchOpen((o) => !o)}
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full bg-accent text-accent-foreground border-none">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t px-4 py-3 bg-background">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                autoFocus
                type="search"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 rounded-full bg-muted/50 border-none focus-visible:ring-1 w-full"
              />
            </form>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted pt-16 pb-8 border-t mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">متجر لمسات مول</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              وجهتك الأولى للتسوق الإلكتروني في المملكة العربية السعودية. نوفر لك أفضل المنتجات بأعلى جودة.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">تسوق الآن</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">تصفح الأقسام</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">اتصل بنا</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">..</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>الشحن والتوصيل</li>
              <li>سياسة الاسترجاع</li>
              <li>الأسئلة الشائعة</li>
              <li>تتبع الطلب</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>الرياض، المملكة العربية السعودية</li>
              <li>support@riyadhstore.sa</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} متجر لمسات مول. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
