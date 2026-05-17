import { useState } from "react";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("تم استلام رسالتك بنجاح", {
        description: "سيقوم فريق خدمة العملاء بالتواصل معك في أقرب وقت ممكن."
      });
      (e.target as HTMLFormElement).reset();
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4">اتصل بنا</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          نحن هنا لخدمتك والإجابة على جميع استفساراتك. لا تتردد في التواصل معنا عبر القنوات المتاحة أو من خلال النموذج أدناه.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        {/* Contact Info */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">العنوان</h3>
              <p className="text-muted-foreground leading-relaxed">
                برج المملكة، طريق الملك فهد<br />
                الرياض 12214<br />
                المملكة العربية السعودية
              </p>
            </div>
          </div>
          
          {/* <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">رقم الهاتف</h3>
              <p className="text-muted-foreground font-mono" dir="ltr">9200 00000</p>
              <p className="text-muted-foreground font-mono" dir="ltr">+966 11 000 0000</p>
            </div>
          </div> */}
          
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
              <p className="text-muted-foreground font-mono">support@riyadhstore.sa</p>
              <p className="text-muted-foreground font-mono">info@riyadhstore.sa</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">ساعات العمل</h3>
              <p className="text-muted-foreground">
                الأحد - الخميس: 9:00 صباحاً - 10:00 مساءً<br />
                الجمعة - السبت: 4:00 مساءً - 11:00 مساءً
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-2">الاسم الكامل</label>
              <Input id="name" required placeholder="أدخل اسمك" className="bg-muted/50 h-12" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
              <Input id="email" type="email" required placeholder="example@domain.com" className="bg-muted/50 h-12" dir="ltr" />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-bold mb-2">الموضوع</label>
              <Input id="subject" required placeholder="عنوان الرسالة" className="bg-muted/50 h-12" />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-bold mb-2">الرسالة</label>
              <Textarea 
                id="message" 
                required 
                placeholder="اكتب رسالتك هنا..." 
                className="bg-muted/50 min-h-[150px] resize-none" 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-xl gap-2 hover-elevate shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإرسال..." : (
                <>
                  إرسال الرسالة <Send className="w-5 h-5 mr-2 rotate-180" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
