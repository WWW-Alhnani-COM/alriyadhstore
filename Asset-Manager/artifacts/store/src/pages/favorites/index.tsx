import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ تعريف المكون داخل نفس الملف (بدون استيراد خارجي)
function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {product.quantity < 5 && product.quantity > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2 font-medium">
              كمية محدودة
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-muted-foreground mb-1">{product.categoryName}</div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-auto font-bold text-lg">{formatCurrency(product.price)}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoriteIds(favorites);
  }, []);

  useEffect(() => {
    // جلب تفاصيل المنتجات المفضلة
    const fetchFavorites = async () => {
      const productPromises = favoriteIds.map(id =>
        fetch(`https://alriyadhstore.onrender.com/api/storefront/products/${id}`).then(res => res.json())
      );
      const productsData = await Promise.all(productPromises);
      setProducts(productsData);
    };
    
    if (favoriteIds.length > 0) {
      fetchFavorites();
    }
  }, [favoriteIds]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500" />
        المنتجات المفضلة
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد منتجات في المفضلة</p>
          <Link href="/products">
            <Button className="mt-4">تصفح المنتجات</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
