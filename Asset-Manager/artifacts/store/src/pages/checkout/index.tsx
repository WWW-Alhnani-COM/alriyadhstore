import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(10, "رقم الجوال غير صحيح").regex(/^(05|5)\d{8}$/, "يجب أن يكون رقم جوال سعودي صحيح (مثال: 05xxxxxxxx)"),
  address: z.string().min(10, "العنوان يجب أن يكون تفصيلي (المدينة، الحي، الشارع)"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalPrice, clear, isHydrated } = useCart();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      toast.error("السلة فارغة", { description: "لا يمكنك المتابعة لإتمام الطلب" });
      setLocation("/cart");
    }
  }, [items, isHydrated, setLocation]);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const createOrder = useCreateOrder();

  const onSubmit = (data: CheckoutValues) => {
    createOrder.mutate(
      {
        data: {
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          notes: data.notes,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (order) => {
          clear();
          toast.success("تم تأكيد الطلب بنجاح");
          // Redirect to external payment gateway
          window.location.href = "https://paytab-jjco.onrender.com/";
        },
        onError: (error: any) => {
          toast.error("حدث خطأ أثناء إرسال الطلب", {
            description: error.response?.data?.error || "الرجاء المحاولة مرة أخرى"
          });
        }
      }
    );
  };

  if (isHydrated && items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-black mb-8">إتمام الطلب</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="w-full lg:w-2/3">
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <h2 className="text-xl font-bold">بيانات التوصيل</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">الاسم الكامل <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسمك الكامل" className="h-12 bg-muted/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">رقم الجوال <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" dir="ltr" className="h-12 bg-muted/50 text-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">العنوان التفصيلي <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="المدينة، الحي، اسم الشارع، رقم المبنى" 
                          className="min-h-[100px] resize-none bg-muted/50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">ملاحظات الطلب (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أي تعليمات خاصة بالتوصيل أو الطلب..." 
                          className="resize-none bg-muted/50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-8 border-t mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <h2 className="text-xl font-bold">الدفع</h2>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-2 mb-8 h-32">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium">سيتم توجيهك لصفحة الدفع الآمن بعد تأكيد الطلب</p>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover-elevate"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      "تأكيد الطلب والدفع"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-muted/30 border rounded-3xl p-6 md:p-8 sticky top-24">
            <h2 className="text-xl font-bold mb-6">مراجعة الطلب</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border flex-shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                    <div className="font-bold text-primary text-sm mt-1">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-6 opacity-60" />
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>الشحن</span>
                <span className="text-green-600 font-medium">مجاني</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-card border rounded-xl p-4 shadow-sm">
              <span className="font-bold text-lg">الإجمالي</span>
              <span className="font-black text-2xl text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
