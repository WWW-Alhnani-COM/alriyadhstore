import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useAdminListProducts,
  useAdminListCategories,
  useAdminCreateProduct, 
  useAdminUpdateProduct, 
  useAdminDeleteProduct,
  getAdminListProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ShoppingBag, Loader2, Search, Star, X } from "lucide-react";
import { MultiImageUpload } from "@/components/MultiImageUpload";

// قائمة الألوان الجاهزة
const COLOR_PRESETS = [
  { name: "أحمر", value: "#ef4444", code: "RED" },
  { name: "أزرق", value: "#3b82f6", code: "BLUE" },
  { name: "أخضر", value: "#22c55e", code: "GREEN" },
  { name: "أسود", value: "#000000", code: "BLACK" },
  { name: "أبيض", value: "#ffffff", code: "WHITE" },
];

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL"];

const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج يجب أن يكون حرفين على الأقل"),
  description: z.string().min(1, "وصف المنتج مطلوب"),
  price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
  quantity: z.coerce.number().min(0, "الكمية يجب أن تكون رقماً موجباً"),
  categoryId: z.coerce.number().min(1, "الرجاء اختيار القسم"),
  images: z.array(z.string()).min(1, "يجب إضافة صورة واحدة على الأقل"),
  sizes: z.string().optional(),
  colors: z.string().optional(),
});

type ProductValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const getFeaturedIds = (): number[] => {
    const saved = localStorage.getItem('featured_products');
    return saved ? JSON.parse(saved) : [];
  };

  const toggleFeatured = (productId: number) => {
    let featuredIds = getFeaturedIds();
    if (featuredIds.includes(productId)) {
      featuredIds = featuredIds.filter(id => id !== productId);
      toast.success("تمت إزالة المنتج من المميزات");
    } else {
      featuredIds.push(productId);
      toast.success("تمت إضافة المنتج للمميزات");
    }
    localStorage.setItem('featured_products', JSON.stringify(featuredIds));
    queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
  };

  const { data: productsData, isLoading } = useAdminListProducts(
    search ? { search } : {},
    { query: { keepPreviousData: true } as any }
  );
  const { data: categories } = useAdminListCategories();
  
  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      price: 0, 
      quantity: 0, 
      categoryId: 0, 
      images: [],
      sizes: "",
      colors: "",
    },
  });

  const parseImages = (imageField: string | null | undefined): string[] => {
    if (!imageField) return [];
    try {
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed)) return parsed;
      return [imageField];
    } catch {
      return [imageField];
    }
  };

  const stringifyImages = (images: string[]): string => {
    return JSON.stringify(images);
  };

  const onSubmit = (data: ProductValues) => {
    const submitData = {
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      categoryId: data.categoryId,
      image: stringifyImages(data.images),
      sizes: JSON.stringify(selectedSizes),
      colors: JSON.stringify(selectedColors),
    };
    
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: submitData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            toast.success("تم تحديث المنتج بنجاح");
            setIsCreateOpen(false);
            setEditingId(null);
            form.reset();
            setSelectedSizes([]);
            setSelectedColors([]);
          },
          onError: (error: any) => {
            toast.error("فشل التحديث", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: submitData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            toast.success("تم إضافة المنتج بنجاح");
            setIsCreateOpen(false);
            form.reset();
            setSelectedSizes([]);
            setSelectedColors([]);
          },
          onError: (error: any) => {
            toast.error("فشل الإضافة", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
          }
        }
      );
    }
  };

  const handleEdit = (product: any) => {
    const images = parseImages(product.image);
    let sizes: string[] = [];
    let colors: string[] = [];
    try {
      sizes = JSON.parse(product.sizes || "[]");
      colors = JSON.parse(product.colors || "[]");
    } catch {}
    
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId,
      images: images,
    });
    setSelectedSizes(sizes);
    setSelectedColors(colors);
    setEditingId(product.id);
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          toast.success("تم حذف المنتج بنجاح");
        },
        onError: (error: any) => {
          toast.error("فشل الحذف", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
        }
      }
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const getDisplayImages = (product: any): string[] => {
    return parseImages(product.image);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المنتجات</h1>
            <p className="text-muted-foreground text-sm">إدارة منتجات المتجر والمخزون</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث في المنتجات..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 h-10 w-full sm:w-64 bg-muted/50 border-none" 
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingId(null);
              form.reset();
              setSelectedSizes([]);
              setSelectedColors([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-10 px-6 font-bold shadow-md hover-elevate">
                <Plus className="w-5 h-5" /> إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">اسم المنتج</FormLabel>
                      <FormControl><Input className="bg-muted/50" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">القسم</FormLabel>
                      <Select value={field.value ? field.value.toString() : ""} onValueChange={(v) => field.onChange(parseInt(v))}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">السعر (ر.س)</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="bg-muted/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">الكمية بالمخزون</FormLabel>
                        <FormControl><Input type="number" className="bg-muted/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>

                  <FormField control={form.control} name="images" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">صور المنتج</FormLabel>
                      <FormControl>
                        <MultiImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          maxImages={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  {/* الأحجام */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <FormLabel className="font-bold">الأحجام المتوفرة</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_PRESETS.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={selectedSizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSize(size)}
                          className="rounded-full"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSizes.map((size) => (
                        <Badge key={size} variant="secondary" className="px-3 py-1">
                          {size}
                          <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => toggleSize(size)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* الألوان */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <FormLabel className="font-bold">الألوان المتوفرة</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <Button
                          key={color.code}
                          type="button"
                          variant={selectedColors.includes(color.name) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColor(color.name)}
                          className="gap-2"
                        >
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((color) => (
                        <Badge key={color} variant="secondary" className="px-3 py-1">
                          {color}
                          <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => toggleColor(color)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">وصف المنتج</FormLabel>
                      <FormControl><Textarea className="bg-muted/50 resize-none min-h-[100px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg mt-4" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ المنتج"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24 font-bold py-4">الصور</TableHead>
                <TableHead className="font-bold py-4">المنتج</TableHead>
                <TableHead className="font-bold py-4">القسم</TableHead>
                <TableHead className="font-bold py-4">السعر</TableHead>
                <TableHead className="font-bold py-4 text-center">المخزون</TableHead>
                <TableHead className="font-bold py-4 text-center">مميز</TableHead>
                <TableHead className="text-left font-bold py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(productsData as any[])?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    لا توجد منتجات مطابقة للبحث.
                  </TableCell>
                </TableRow>
              ) : (
                (productsData as any[])?.map((product) => {
                  const images = getDisplayImages(product);
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex -space-x-2">
                          {images.slice(0, 3).map((img: string, idx: number) => (
                            <div key={idx} className="w-8 h-8 rounded-full overflow-hidden bg-muted border-2 border-background">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {images.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background">
                              +{images.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold line-clamp-1">{product.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {product.id}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="font-medium">{product.categoryName}</Badge></TableCell>
                      <TableCell className="font-bold text-primary">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">
                        {product.quantity === 0 ? (
                          <Badge variant="destructive" className="font-bold">نفذت الكمية</Badge>
                        ) : product.quantity < 10 ? (
                          <Badge className="bg-amber-100 text-amber-800 border-none font-bold hover:bg-amber-100">{product.quantity}</Badge>
                        ) : (
                          <Badge variant="outline" className="font-bold border-none bg-muted">{product.quantity}</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(product.id)}
                          className={getFeaturedIds().includes(product.id) ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}
                        >
                          <Star className={`w-5 h-5 ${getFeaturedIds().includes(product.id) ? "fill-yellow-500" : ""}`} />
                        </Button>
                      </TableCell>
                      
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف منتج "{product.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2 sm:gap-0">
                                <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
