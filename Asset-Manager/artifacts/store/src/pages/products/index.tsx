import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListStorefrontProducts, useListStorefrontCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ✅ دالة لاستخراج الصورة الأولى من JSON string أو من رابط عادي
const getFirstImage = (imageField: string | null | undefined): string => {
  if (!imageField) return "/placeholder-image.jpg";
  try {
    const parsed = JSON.parse(imageField);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0]; // إرجاع الصورة الأولى
    }
    return imageField;
  } catch {
    return imageField;
  }
};

export default function Products() {
  const [searchParams] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    urlParams.get("category") ? parseInt(urlParams.get("category")!) : null
  );
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | null>(
    (urlParams.get("sort") as any) || "newest"
  );
  const [page, setPage] = useState(parseInt(urlParams.get("page") || "1"));

  const { data: categories } = useListStorefrontCategories();
  const { data: productsData, isLoading } = useListStorefrontProducts({
    search: search || null,
    categoryId: categoryId,
    sort: sort,
    page: page,
    pageSize: 12,
  }, { query: { keepPreviousData: true } as any });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl();
  };

  const handleCategoryChange = (val: string) => {
    setCategoryId(val === "all" ? null : parseInt(val));
    setPage(1);
    updateUrl();
  };

  const handleSortChange = (val: string) => {
    setSort(val as any);
    setPage(1);
    updateUrl();
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId(null);
    setSort("newest");
    setPage(1);
    updateUrl();
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("category", categoryId.toString());
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground mb-8">
        <ol className="flex items-center space-x-2 space-x-reverse">
          <li><Link href="/" className="hover:text-primary">الرئيسية</Link></li>
          <li><ChevronLeft className="h-4 w-4" /></li>
          <li className="font-semibold text-foreground">المنتجات</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              تصفية النتائج
            </h3>
            
            {(search || categoryId || sort !== "newest") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive mb-4 w-full justify-start px-0"
              >
                <X className="h-4 w-4 ml-2" /> مسح كل الفلاتر
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">البحث</h4>
            <form onSubmit={handleSearch} className="relative">
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="ابحث عن منتج..." 
                className="pr-10 bg-muted/50 border-none"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">الأقسام</h4>
            <div className="flex flex-col gap-2">
              <Button 
                variant={categoryId === null ? "default" : "ghost"} 
                className={`justify-start w-full ${categoryId === null ? '' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                onClick={() => handleCategoryChange("all")}
              >
                الكل
              </Button>
              {categories?.map(cat => (
                <Button 
                  key={cat.id}
                  variant={categoryId === cat.id ? "default" : "ghost"} 
                  className={`justify-start w-full ${categoryId === cat.id ? '' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                  onClick={() => handleCategoryChange(cat.id.toString())}
                >
                  {cat.name}
                  <span className="mr-auto opacity-70 text-xs">({cat.productCount})</span>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              {categoryId && categories 
                ? categories.find(c => c.id === categoryId)?.name || 'المنتجات' 
                : search 
                  ? `نتائج البحث عن "${search}"`
                  : 'جميع المنتجات'}
              <span className="text-sm font-normal text-muted-foreground mr-3">
                ({productsData?.total || 0} منتج)
              </span>
            </h1>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">ترتيب حسب:</span>
              <Select value={sort || "newest"} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder="ترتيب المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price_asc">السعر: الأقل إلى الأعلى</SelectItem>
                  <SelectItem value="price_desc">السعر: الأعلى إلى الأقل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-none shadow-sm h-full flex flex-col">
                  <Skeleton className="aspect-square w-full rounded-t-xl rounded-b-none" />
                  <CardContent className="p-4 space-y-3 flex-grow flex flex-col">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3 mt-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !productsData?.items?.length ? (
            <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">لم يتم العثور على منتجات</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                جرب البحث بكلمات مختلفة أو قم بإزالة بعض الفلاتر لرؤية المزيد من النتائج.
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-full px-8">
                مسح الفلاتر
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {productsData.items.map(product => {
                  // ✅ استخدام الصورة الأولى فقط للعرض في بطاقة المنتج
                  const displayImage = getFirstImage(product.image);
                  
                  return (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card cursor-pointer h-full flex flex-col">
                        <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-muted/30">
                          <img 
                            src={displayImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.quantity === 0 ? (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                              <Badge variant="outline" className="bg-background/80 text-foreground border-foreground/20 font-bold px-3 py-1">نفذت الكمية</Badge>
                            </div>
                          ) : product.quantity < 5 ? (
                            <Badge variant="destructive" className="absolute top-2 right-2 font-medium">كمية محدودة</Badge>
                          ) : null}
                        </div>
                        <CardContent className="p-3 sm:p-4 flex flex-col flex-grow">
                          <div className="text-xs text-muted-foreground mb-1 line-clamp-1">{product.categoryName}</div>
                          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                          <div className="mt-auto font-bold text-base sm:text-lg text-primary">{formatCurrency(product.price)}</div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {productsData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 border-t pt-8">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => { setPage(p => p - 1); updateUrl(); window.scrollTo(0,0); }}
                    disabled={page === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex gap-1 mx-4">
                    {Array.from({ length: productsData.totalPages }).map((_, i) => {
                      const p = i + 1;
                      if (productsData.totalPages > 7 && (p < page - 1 || p > page + 1) && p !== 1 && p !== productsData.totalPages) {
                        if (p === 2 || p === productsData.totalPages - 1) return <span key={p} className="px-2 text-muted-foreground">...</span>;
                        return null;
                      }
                      
                      return (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "ghost"}
                          size="icon"
                          onClick={() => { setPage(p); updateUrl(); window.scrollTo(0,0); }}
                          className={page === p ? "font-bold rounded-full w-9 h-9" : "w-9 h-9 rounded-full"}
                        >
                          {p}
                        </Button>
                      );
                    })}
                  </div>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => { setPage(p => p + 1); updateUrl(); window.scrollTo(0,0); }}
                    disabled={page === productsData.totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
