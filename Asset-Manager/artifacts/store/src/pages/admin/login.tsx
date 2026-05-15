import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Store, Lock, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const login = useAdminLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginValues) => {
    login.mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("تم تسجيل الدخول بنجاح");
          setLocation("/admin/dashboard");
        },
        onError: () => {
          toast.error("فشل تسجيل الدخول", {
            description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-foreground">متجر الرياض</h1>
          <p className="text-muted-foreground">بوابة إدارة المتجر</p>
        </div>

        <div className="bg-card border rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">تسجيل الدخول للإدارة</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@store.sa" type="email" dir="ltr" className="h-12 bg-muted/50 text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" dir="ltr" className="h-12 bg-muted/50 text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl mt-4" 
                disabled={login.isPending}
              >
                {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm rounded-xl text-center font-mono border border-amber-200 dark:border-amber-900/50">
            <div className="font-bold mb-1 font-sans">بيانات الدخول التجريبية:</div>
            admin@store.sa / admin123
          </div>
        </div>
      </div>
    </div>
  );
}