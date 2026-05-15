import { Link } from "wouter";
import { useListStorefrontCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function Categories() {
  const { data: categories, isLoading } = useListStorefrontCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground mb-8">
        <ol className="flex items-center space-x-2 space-x-reverse">
          <li><Link href="/" className="hover:text-primary">الرئيسية</Link></li>
          <li><ChevronLeft className="h-4 w-4" /></li>
          <li className="font-semibold text-foreground">الأقسام</li>
        </ol>
      </nav>

      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-black mb-4">تصفح الأقسام</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          اكتشف تشكيلتنا الواسعة من المنتجات الموزعة على أقسامنا المختلفة لتسهيل تجربة التسوق الخاصة بك.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories?.map(category => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted flex items-center justify-center cursor-pointer hover-elevate shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-10 transition-opacity group-hover:from-black/90" />
                
                {/* Visual placeholder since categories don't have dedicated images in the schema yet */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>

                <div className="relative z-20 text-center text-white p-6 w-full mt-auto translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm font-medium border border-white/10">
                    {category.productCount} منتج
                    <ChevronLeft className="w-4 h-4 mr-2" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}