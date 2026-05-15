import { useRoute, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Copy, ExternalLink, ArrowRight, Package, Truck, Clock } from "lucide-react";
import { toast } from "sonner";

export default function OrderSuccess() {
  const [, params] = useRoute("/order/success/:id");
  const id = parseInt(params?.id || "0");

  const { data: order, isLoading, isError } = useGetOrder(id, {
    query: { enabled: !!id } as any,
  });

  const copyOrderId = () => {
    navigator.clipboard.writeText(`#${id.toString().padStart(6, '0')}`);
    toast.success("تم نسخ رقم الطلب");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center space-y-8">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
        <div className="bg-card border rounded-3xl p-8 text-right space-y-6 mt-12">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">الطلب غير موجود</h2>
        <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على تفاصيل هذا الطلب.</p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8">العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      pending: { label: "بانتظار الدفع", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
      paid: { label: "تم الدفع", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      shipped: { label: "تم الشحن", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
      cancelled: { label: "ملغي", color: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
    };
    
    const config = statusMap[status] || { label: status, color: "bg-muted text-muted-foreground" };
    return <Badge className={`${config.color} border-none font-bold text-sm px-3 py-1`}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white dark:border-background">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-4">شكراً لتسوقك معنا!</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          تم استلام طلبك بنجاح. لقد أرسلنا تفاصيل الطلب إلى رقم جوالك.
        </p>
      </div>

      <div className="bg-card border shadow-sm rounded-3xl overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              تاريخ الطلب: <span className="font-medium text-foreground">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-mono">
                #{order.id.toString().padStart(6, '0')}
              </h2>
              <Button variant="ghost" size="icon" onClick={copyOrderId} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="نسخ رقم الطلب">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">حالة الطلب</div>
              {getStatusBadge(order.status)}
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">إجمالي الطلب</div>
              <div className="font-black text-xl text-primary">{formatCurrency(order.totalPrice)}</div>
            </div>
          </div>
        </div>

        {order.status === "pending" && (
          <div className="p-6 md:p-8 border-b bg-amber-50 dark:bg-amber-950/20">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <CreditCard className="w-5 h-5" /> مطلوب الدفع
            </h3>
            {order.paymentLink ? (
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-amber-700 dark:text-amber-400">
                  يرجى إكمال عملية الدفع لتأكيد طلبك والبدء في تجهيزه.
                </p>
                <a href={order.paymentLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto font-bold bg-amber-600 hover:bg-amber-700 text-white gap-2">
                    ادفع الآن <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-amber-700 dark:text-amber-400 font-medium">سيتم إرسال رابط الدفع قريباً في رسالة نصية.</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-500/80">يقوم فريقنا بمراجعة الطلب حالياً وتجهيز فاتورة الدفع.</p>
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" /> 
              معلومات التوصيل
            </h3>
            <div className="bg-muted/30 p-5 rounded-2xl border space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">الاسم</div>
                <div className="font-semibold">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">رقم الجوال</div>
                <div className="font-semibold font-mono">{order.phone}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">العنوان</div>
                <div className="font-semibold leading-relaxed">{order.address}</div>
              </div>
              {order.notes && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ملاحظات</div>
                  <div className="text-sm">{order.notes}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              المنتجات ({order.items.length})
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center p-3 rounded-xl border bg-muted/10">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-sm line-clamp-1">{item.productName}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-md">الكمية: {item.quantity}</span>
                      <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/products">
          <Button variant="outline" size="lg" className="rounded-full px-8 gap-2 font-bold">
            مواصلة التسوق <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Needed missing import
import { CreditCard } from "lucide-react";