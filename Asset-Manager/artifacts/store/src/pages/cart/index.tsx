import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, clear, totalPrice, totalItems } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mb-8">
          <ShoppingCart className="w-16 h-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-foreground">سلة التسوق فارغة</h1>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          لم تقم بإضافة أي منتجات إلى سلة التسوق حتى الآن. اكتشف تشكيلتنا الواسعة وابدأ التسوق.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold shadow-lg hover-elevate">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        سلة التسوق
        <span className="text-lg font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'}
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-muted-foreground">المنتجات المضافة</span>
            <Button variant="ghost" size="sm" onClick={clear} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 ml-2" /> إفراغ السلة
            </Button>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.productId} className="flex gap-4 p-4 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                <Link href={`/products/${item.productId}`}>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div className="flex justify-between gap-4">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-bold text-base sm:text-lg line-clamp-2 hover:text-primary cursor-pointer">{item.name}</h3>
                    </Link>
                    <div className="font-black text-lg text-primary whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex items-center bg-muted/50 border rounded-full overflow-hidden h-10 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="w-12 text-center font-bold text-sm">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="w-10 h-full flex items-center justify-center hover:bg-muted text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-10 h-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-muted/30 border rounded-3xl p-6 md:p-8 sticky top-24">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
            
            <div className="space-y-4 text-sm md:text-base mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي ({totalItems} منتجات)</span>
                <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رسوم الشحن</span>
                <span className="font-semibold text-green-600">مجاني</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الضرائب (15%)</span>
                <span className="font-semibold">مشمولة في السعر</span>
              </div>
            </div>
            
            <Separator className="mb-6 opacity-60" />
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">الإجمالي الكلي</span>
              <div className="text-right">
                <div className="font-black text-2xl md:text-3xl text-primary">{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-muted-foreground mt-1">المبلغ يشمل ضريبة القيمة المضافة</div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover-elevate gap-2"
              onClick={() => setLocation("/checkout")}
            >
              متابعة الطلب
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground opacity-60 grayscale">
              <div className="flex gap-2">
                {/* Visual indicators for payment methods */}
                <div className="w-10 h-6 bg-foreground rounded-sm"></div>
                <div className="w-10 h-6 bg-foreground rounded-sm"></div>
                <div className="w-10 h-6 bg-foreground rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}