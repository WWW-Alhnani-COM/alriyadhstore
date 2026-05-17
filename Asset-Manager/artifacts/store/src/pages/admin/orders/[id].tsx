import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { 
  useAdminGetOrder, 
  useAdminUpdateOrder,
  getAdminGetOrderQueryKey,
  getAdminListOrdersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Package, User, Truck, Receipt, Loader2, Save } from "lucide-react";

export default function AdminOrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = parseInt(params?.id || "0");
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useAdminGetOrder(id, { query: { enabled: !!id } as any });
  const updateMutation = useAdminUpdateOrder();

  const [status, setStatus] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string>("");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentLink(order.paymentLink || "");
    }
  }, [order]);

  const handleSave = () => {
    updateMutation.mutate(
      { 
        id, 
        data: { 
          status: status as any,
          paymentLink: paymentLink || null
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminGetOrderQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
          toast.success("تم تحديث الطلب بنجاح");
        },
        onError: (error: any) => {
          toast.error("فشل التحديث", { description: error.response?.data?.error || "حدث خطأ غير متوقع" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-3xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>;
  }

  if (!order) return <div className="text-center py-20 text-xl font-bold">الطلب غير موجود</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/admin/orders" className="hover:text-primary">الطلبات</Link>
        <ChevronLeft className="w-4 h-4" />
        <span className="font-bold text-foreground">طلب #{order.id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            طلب #{order.id}
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-3 font-bold">
              {formatCurrency(order.totalPrice)}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            بتاريخ: {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || (status === order.status && paymentLink === (order.paymentLink || ""))}
            className="gap-2 font-bold px-6 h-12 rounded-xl shadow-md hover-elevate"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Update Status Card */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> حالة الطلب والدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold">حالة الطلب</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 bg-muted/50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" className="font-medium text-amber-600">بانتظار الدفع</SelectItem>
                  <SelectItem value="paid" className="font-medium text-blue-600">تم الدفع</SelectItem>
                  <SelectItem value="shipped" className="font-medium text-emerald-600">تم الشحن</SelectItem>
                  <SelectItem value="cancelled" className="font-medium text-destructive">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold">رابط الدفع (اختياري)</label>
              <Input 
                value={paymentLink} 
                onChange={(e) => setPaymentLink(e.target.value)} 
                placeholder="https://..." 
                dir="ltr"
                className="h-12 bg-muted/50 border-none text-left"
              />
              <p className="text-xs text-muted-foreground">يظهر للعميل في حالة الطلب "بانتظار الدفع"</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> بيانات العميل والتوصيل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">الاسم</div>
                <div className="font-bold text-lg">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">الجوال</div>
                <div className="font-bold font-mono text-lg">{order.phone}</div>
              </div>
            </div>
            
            <Separator className="opacity-50" />
            
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">عنوان التوصيل</div>
                <div className="font-medium leading-relaxed bg-muted/30 p-3 rounded-xl">{order.address}</div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 p-3 rounded-xl text-sm border border-amber-100 dark:border-amber-900/30">
                <span className="font-bold block mb-1">ملاحظات العميل:</span>
                {order.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> المنتجات المطلوبة ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="w-16 py-4">صورة</TableHead>
                <TableHead className="font-bold py-4">المنتج</TableHead>
                <TableHead className="font-bold py-4 text-center">السعر</TableHead>
                <TableHead className="font-bold py-4 text-center">الكمية</TableHead>
                <TableHead className="text-left font-bold py-4 px-6">المجموع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="py-4 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border">
                      {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{item.productName}</TableCell>
                  <TableCell className="text-center font-medium">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-bold">{item.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-left px-6 font-black text-primary">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="bg-muted/20 p-6 border-t flex flex-col items-end gap-2">
            <div className="flex justify-between w-full max-w-sm text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between w-full max-w-sm text-green-600 font-medium">
              <span>الشحن</span>
              <span>مجاني</span>
            </div>
            <Separator className="w-full max-w-sm my-2 opacity-50" />
            <div className="flex justify-between w-full max-w-sm items-center">
              <span className="font-bold text-lg">الإجمالي الكلي</span>
              <span className="font-black text-3xl text-primary">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
