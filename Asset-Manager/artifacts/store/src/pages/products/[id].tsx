import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useGetStorefrontProduct } from "@workspace/api-client-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  Share2,
  Heart,
  ChevronRight
} from "lucide-react";

// ✅ دالة لتحويل JSON string إلى مصفوفة صور
const parseImages = (imageField: string | null | undefined): string[] => {
  if (!imageField) return [];
  try {
    // محاولة تحليل JSON
    const parsed = JSON.parse(imageField);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [imageField];
  } catch {
    // إذا لم يكن JSON، فهي صورة واحدة
    return [imageField];
  }
};

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0");
  
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  const { data: product, isLoading, isError } = useGetStorefrontProduct(id, {
    query: { enabled: !!id } as any,
  });

  // ✅ تعريف isOutOfStock
  const isOutOfStock = product?.quantity === 0;
  
  // ✅ الحصول على مصفوفة الصور باستخدام دالة parseImages
  const images = parseImages(product?.image);

  // التحقق من حالة المفضلة عند تحميل المنتج
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  // إعادة تعيين مؤشر الصورة عند تغيير المنتج
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || product.image,
      quantity,
    });
    
    toast.success("تم إضافة المنتج للسلة", {
      description: `${product.name} (${quantity})`
    });
  };

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const newFavorites = favorites.filter((favId: number) => favId !== id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success("تم إزالة المنتج من المفضلة");
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("تم إضافة المنتج إلى المفضلة");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'متجر لمسات مول',
      text: `تسوق ${product?.name} من متجر لمسات مول`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("تمت المشاركة بنجاح");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("تم نسخ رابط المنتج", {
          description: "يمكنك مشاركته الآن"
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.quantity) {
      setQuantity(newQty);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-1/2 aspect-square rounded-2xl" />
          <div className="w-full md:w-1/2 space-y-6 pt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-14 w-32" />
              <Skeleton className="h-14 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">المنتج غير موجود</h2>
        <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">العودة للمنتجات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex text-sm text-muted-foreground mb-8">
        <ol className="flex items-center space-x-2 space-x-reverse">
          <li><Link href="/" className="hover:text-primary">الرئيسية</Link></li>
          <li><ChevronLeft className="h-4 w-4" /></li>
          <li><Link href="/products" className="hover:text-primary">المنتجات</Link></li>
          <li><ChevronLeft className="h-4 w-4" /></li>
          {product.categoryName && (
            <>
              <li><Link href={`/products?category=${product.categoryId}`} className="hover:text-primary">{product.categoryName}</Link></li>
              <li><ChevronLeft className="h-4 w-4" /></li>
            </>
          )}
          <li className="font-semibold text-foreground line-clamp-1 max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 mb-24">
        {/* Product Image Gallery */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border group">
            <img 
              src={images[currentImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
            
            {/* أزرار التنقل بين الصور (للمعرض) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                {/* مؤشر الصور */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* حالة المنتج */}
            {isOutOfStock ? (
              <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-1.5 rounded-full font-bold shadow-lg">
                نفذت الكمية
              </div>
            ) : product.quantity < 5 ? (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold shadow-lg">
                كمية محدودة ({product.quantity} متبقي)
              </div>
            ) : null}
          </div>

          {/* الصور المصغرة (إذا كان هناك أكثر من صورة) */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentImageIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${product.name} - صورة ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <Link href={`/products?category=${product.categoryId}`}>
              <Badge variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer px-3 py-1 text-sm font-medium">
                {product.categoryName}
              </Badge>
            </Link>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleToggleFavorite}
                className={`rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? "text-red-500 hover:text-red-600 bg-red-50" 
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare}
                className="text-muted-foreground hover:text-primary rounded-full transition-all duration-200"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-3xl md:text-4xl font-black text-primary mb-6 flex items-end gap-3">
            {formatCurrency(product.price)}
            <span className="text-sm font-normal text-muted-foreground mb-1.5">شامل الضريبة</span>
          </div>

          <Separator className="mb-6 opacity-50" />
          
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground mb-8 leading-relaxed whitespace-pre-wrap">
            {product.description || "لا يوجد وصف متاح لهذا المنتج."}
          </div>

          <div className="mt-auto space-y-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
            {!isOutOfStock ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">الكمية</span>
                  <div className="flex items-center bg-background border rounded-full overflow-hidden shadow-sm">
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.quantity}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center font-bold text-lg select-none">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover-elevate gap-3"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  إضافة للسلة
                  <span className="opacity-50 mx-2">|</span>
                  {formatCurrency(product.price * quantity)}
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                variant="secondary"
                disabled 
                className="w-full h-14 text-lg font-bold rounded-xl"
              >
                المنتج غير متوفر حالياً
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">توصيل سريع</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">منتج أصلي</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">إرجاع مجاني</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
