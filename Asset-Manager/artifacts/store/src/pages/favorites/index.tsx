import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetStorefrontProduct } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";

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
