// components/MobileMenu.tsx
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Tag, 
  Info, 
  Phone, 
  ShoppingCart,
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const [cartItems, setCartItems] = useState(0);

  // جلب عدد المنتجات في السلة
  useEffect(() => {
    const updateCart = () => {
      const cart = localStorage.getItem("store_cart_v1");
      if (cart) {
        try {
          const items = JSON.parse(cart);
          const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartItems(total);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCartItems(0);
      }
    };

    updateCart();
    window.addEventListener("storage", updateCart);
    window.addEventListener("store_cart_change", updateCart);
    
    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("store_cart_change", updateCart);
    };
  }, []);

  const mainNavItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/products", label: "المنتجات", icon: Package },
    { href: "/categories", label: "الأقسام", icon: Tag },
    { href: "/cart", label: "سلة التسوق", icon: ShoppingCart, badge: cartItems },
  ];

  const secondaryNavItems = [
    { href: "/about", label: "من نحن", icon: Info },
    { href: "/contact", label: "اتصل بنا", icon: Phone },
  ];

  const features = [
    { icon: Truck, title: "شحن سريع", desc: "توصيل خلال 24-48 ساعة" },
    { icon: ShieldCheck, title: "جودة أصلية", desc: "منتجات أصلية 100%" },
  ];

  const handleClose = () => setOpen(false);

  // إغلاق القائمة عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-muted transition-all duration-200"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[85vw] max-w-[380px] p-0 animate-in slide-in-from-right duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <SheetTitle className="text-lg font-bold">القائمة</SheetTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Logo Section */}
          <div className="px-4 py-6 bg-gradient-to-r from-primary/5 to-transparent">
            <Link href="/" onClick={handleClose}>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                متجر لمسات مول
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                وجهتك الأولى للتسوق الإلكتروني
              </p>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 py-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`group flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                  location === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <span className={`font-medium ${
                    location === item.href ? "text-primary" : ""
                  }`}>
                    {item.label}
                  </span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="rounded-full bg-primary text-primary-foreground px-2 min-w-[20px] justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Separator */}
          <div className="h-px bg-border mx-4 my-2" />

          {/* Secondary Navigation */}
          <nav className="py-2">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                  location === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Features Section */}
          <div className="p-4 bg-muted/30 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">خدماتنا</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pb-6">
            {/* <Link 
              href="/" 
              onClick={handleClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200"
            > */}
              {/* <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link> */}
            <div className="text-center text-[10px] text-muted-foreground mt-4">
              © {new Date().getFullYear()} متجر لمسات مول
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
