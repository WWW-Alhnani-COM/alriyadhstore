import { Link } from "wouter";
import { useGetFeaturedProducts, useGetBestSellers, useGetNewArrivals, useListStorefrontCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { ArrowLeft, Truck, ShieldCheck, Clock, CreditCard, ChevronLeft } from "lucide-react";
import heroImage from "@/assets/hero-banner.png";
import lifestyle1 from "@/assets/lifestyle-1.png";
import lifestyle2 from "@/assets/lifestyle-2.png";
import catClothing from "@/assets/cat-clothing.png";
import catElectronics from "@/assets/cat-electronics.png";
import catBeauty from "@/assets/cat-beauty.png";

const CATEGORY_IMAGES: Record<string, string> = {
  clothing: catClothing,
  electronics: catElectronics,
  beauty: catBeauty,
};

const CATEGORY_FALLBACK = [catClothing, catElectronics, catBeauty];

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
            <Badge variant="destructive" className="absolute top-2 right-2 font-medium">كمية محدودة</Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-muted-foreground mb-1">{product.categoryName}</div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="mt-auto font-bold text-lg">{formatCurrency(product.price)}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { data: categories } = useListStorefrontCategories();
  const { data: featured } = useGetFeaturedProducts();
  const { data: bestSellers } = useGetBestSellers();
  const { data: newArrivals } = useGetNewArrivals();

  return (
    <div className="pb-16">
      {/* Hero Section */}
      {/* Hero Section - Banner version */}
{/* Hero Section - Image Only Banner */}
<section className="relative w-full overflow-hidden">
  <div className="relative w-full">
    <img 
      src={heroImage} 
      alt="تسوق الآن" 
      className="w-full h-full object-cover"
      style={{ maxHeight: '300px' }} // يمكنك تغيير الارتفاع هنا
    />
  </div>
</section>
     

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">تسوق حسب القسم</h2>
            <Link href="/categories" className="text-primary font-medium hover:underline flex items-center">
              عرض الكل <ChevronLeft className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {categories.slice(0, 6).map((category, idx) => {
              const img =
                CATEGORY_IMAGES[category.slug] ??
                CATEGORY_FALLBACK[idx % CATEGORY_FALLBACK.length];
              return (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <div className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-muted cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                    <img
                      src={img}
                      alt={category.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-white/90 text-foreground border-none font-medium backdrop-blur-sm">
                        {category.productCount} منتج
                      </Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 text-white">
                      <h3 className="text-2xl md:text-3xl font-extrabold mb-2 drop-shadow-md">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                        تسوق الآن
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-16 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">منتجات مميزة</h2>
              <Link href="/products" className="text-primary font-medium hover:underline flex items-center">
                عرض الكل <ChevronLeft className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lifestyle Banners */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/products">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group cursor-pointer hover-elevate">
              <img src={lifestyle1} alt="موضة وجمال" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute bottom-0 right-0 p-8 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-3xl font-bold mb-2">أناقة بلا حدود</h3>
                <p className="mb-4 text-white/80 max-w-sm">تشكيلة واسعة من أرقى العلامات التجارية في عالم الأزياء والجمال.</p>
                <span className="inline-flex items-center text-sm font-bold bg-white text-black px-4 py-2 rounded-full">
                  تسوق التشكيلة <ChevronLeft className="w-4 h-4 mr-1" />
                </span>
              </div>
            </div>
          </Link>
          <Link href="/products">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group cursor-pointer hover-elevate">
              <img src={lifestyle2} alt="إلكترونيات" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute bottom-0 right-0 p-8 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-3xl font-bold mb-2">أحدث التقنيات</h3>
                <p className="mb-4 text-white/80 max-w-sm">ارتقِ بأسلوب حياتك مع أحدث الأجهزة الذكية والإلكترونيات.</p>
                <span className="inline-flex items-center text-sm font-bold bg-white text-black px-4 py-2 rounded-full">
                  تصفح الأجهزة <ChevronLeft className="w-4 h-4 mr-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">الأكثر مبيعاً</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
       {/* Brand Promises */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "شحن سريع", desc: "توصيل خلال 24-48 ساعة" },
              { icon: ShieldCheck, title: "جودة أصلية", desc: "منتجات أصلية 100%" },
              { icon: CreditCard, title: "دفع آمن", desc: "طرق دفع متعددة وآمنة" },
              { icon: Clock, title: "دعم متواصل", desc: "خدمة عملاء على مدار الساعة" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
