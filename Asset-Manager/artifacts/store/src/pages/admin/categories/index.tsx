import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useAdminListCategories, 
  useAdminCreateCategory, 
  useAdminUpdateCategory, 
  useAdminDeleteCategory,
  getAdminListCategoriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Tags, Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  slug: z.string().min(2, "المعرف يجب أن يكون حرفين على الأقل").regex(/^[a-z0-9-]+$/, "المعرف يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"),
});

type CategoryValues = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useAdminListCategories();
  const createMutation = useAdminCreateCategory();
  const updateMutation = useAdminUpdateCategory();
  const deleteMutation = useAdminDeleteCategory();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  const onSubmit = (data: CategoryValues) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
            toast.success("تم تحديث القسم بنجاح");
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
            queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
            toast.success("تم إضافة القسم بنجاح");
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

  const handleEdit = (category: any) => {
    form.reset({ name: category.name, slug: category.slug });
    setEditingId(category.id);
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          toast.success("تم حذف القسم بنجاح");
        },
        onError: (error: any) => {
          toast.error("فشل الحذف", { description: error.response?.data?.error || "لا يمكن حذف قسم يحتوي على منتجات" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">الأقسام</h1>
            <p className="text-muted-foreground text-sm">إدارة أقسام وتصنيفات المنتجات</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingId(null);
            form.reset({ name: "", slug: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-md hover-elevate">
              <Plus className="w-5 h-5" /> إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingId ? "تعديل قسم" : "إضافة قسم جديد"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">اسم القسم</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: إلكترونيات" className="h-12 bg-muted/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">المعرف (انجليزي فقط)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: electronics" dir="ltr" className="h-12 bg-muted/50 text-left" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-bold text-lg" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التغييرات"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 font-bold py-4">ID</TableHead>
                <TableHead className="font-bold py-4">اسم القسم</TableHead>
                <TableHead className="font-bold py-4">المعرف (Slug)</TableHead>
                <TableHead className="font-bold py-4 text-center">المنتجات</TableHead>
                <TableHead className="text-left font-bold py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    لا توجد أقسام حالياً. قم بإضافة قسم جديد للبدء.
                  </TableCell>
                </TableRow>
              ) : (
                categories?.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-muted-foreground">{category.id}</TableCell>
                    <TableCell className="font-bold text-base">{category.name}</TableCell>
                    <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-full font-bold">
                        {(category as any).productCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
                                سيتم حذف قسم "{category.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء، ولا يمكن حذف القسم إذا كان يحتوي على منتجات مرتبطة به.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2 sm:gap-0">
                              <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(category.id)} 
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
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