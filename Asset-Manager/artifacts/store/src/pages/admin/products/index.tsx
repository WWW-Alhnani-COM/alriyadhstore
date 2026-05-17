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
import { Plus, Edit2, Trash2, ShoppingBag, Loader2, Search } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج يجب أن يكون حرفين على الأقل"),
  description: z.string().min(1, "وصف المنتج مطلوب"),
  price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
  quantity: z.coerce.number().min(0, "الكمية يجب أن تكون رقماً موجباً"),
  categoryId: z.coerce.number().min(1, "الرجاء اختيار القسم"),
  image: z.string().url("يجب إدخال رابط صورة صحيح"),
});

type ProductValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

const { data: productsData, isLoading } = useAdminListProducts(
  search ? { search } : {},  // ✅ فقط يرسل search إذا كان موجوداً
  { query: { keepPreviousData: true } as any }
);
  const { data: categories } = useAdminListCategories();
  
  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, quantity: 0, categoryId: 0, image: "" },
  });

  const onSubmit = (data: ProductValues) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            toast.success("تم تحديث المنتج بنجاح");
            setIsCreateOpen(false);
            setEditingId(null);
            form.reset();
          },
          onError: (error: any) => {
            toast.error("فشل التحديث", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            toast.success("تم إضافة المنتج بنجاح");
            setIsCreateOpen(false);
            form.reset();
          },
          onError: (error: any) => {
            toast.error("فشل الإضافة", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
          }
        }
      );
    }
  };

  const handleEdit = (product: any) => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId,
      image: product.image
    });
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
              form.reset({ name: "", description: "", price: 0, quantity: 0, categoryId: 0, image: "" });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-10 px-6 font-bold shadow-md hover-elevate">
                <Plus className="w-5 h-5" /> إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">رابط الصورة</FormLabel>
                      <FormControl><Input placeholder="https://..." dir="ltr" className="bg-muted/50 text-left" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

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
                <TableHead className="w-16 font-bold py-4">صورة</TableHead>
                <TableHead className="font-bold py-4">المنتج</TableHead>
                <TableHead className="font-bold py-4">القسم</TableHead>
                <TableHead className="font-bold py-4">السعر</TableHead>
                <TableHead className="font-bold py-4 text-center">المخزون</TableHead>
                <TableHead className="text-left font-bold py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(productsData as any[])?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    لا توجد منتجات مطابقة للبحث.
                  </TableCell>
                </TableRow>
              ) : (
                (productsData as any[])?.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
