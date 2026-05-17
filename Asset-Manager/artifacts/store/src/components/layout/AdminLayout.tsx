import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@workspace/api-client-react";
import { LayoutDashboard, ShoppingBag, Tags, ShoppingCart, LogOut, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/products", label: "المنتجات", icon: ShoppingBag },
  { href: "/admin/categories", label: "الأقسام", icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, isError } = useAdminMe({
    query: { retry: false, refetchOnWindowFocus: false } as any,
  });

  const logout = useAdminLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

const user = { id: 1, email: "admin@store.sa" }; // بيانات وهمية

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-l flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
            <Store className="h-6 w-6" />
            <span>إدارة المتجر</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/admin/dashboard' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t">
          <div className="mb-4 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md overflow-hidden text-ellipsis">
            {user.email}
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 md:px-8">
          <h1 className="text-lg font-semibold">
            {navItems.find(i => location.startsWith(i.href))?.label || "لوحة التحكم"}
          </h1>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Store className="h-4 w-4" />
              عرض المتجر
            </Button>
          </Link>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
