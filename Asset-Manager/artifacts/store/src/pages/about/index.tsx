import { Store, Shield, HeartHandshake, Target, MapPin, Mail, Phone } from "lucide-react";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-foreground tracking-tight">عن متجر لمسات مول</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            تأسس متجر لمسات مول برؤية واضحة: تقديم تجربة تسوق إلكتروني ترقى لتطلعات المستهلك السعودي من حيث الجودة، والتنوع، والموثوقية.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">رؤيتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون الوجهة الأولى والمفضلة للتسوق الإلكتروني في المملكة العربية السعودية والشرق الأوسط، من خلال تقديم تجربة استثنائية تجمع بين التكنولوجيا المتقدمة والخدمة المتميزة.
              </p>
            </div>
            
            <div className="text-center p-8 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">قيمنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                الشفافية المطلقة، الجودة غير القابلة للمساومة، الابتكار المستمر، والالتزام التام برضا عملائنا في كل خطوة من رحلة التسوق.
              </p>
            </div>
            
            <div className="text-center p-8 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">مهمتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                توفير منتجات أصلية 100% من أفضل العلامات التجارية العالمية، مع خيارات دفع آمنة وتوصيل سريع يغطي كافة مناطق المملكة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Snippet */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">نحن دائماً بالقرب منك</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="font-semibold text-lg">المقر الرئيسي</span>
              <span className="text-muted-foreground">الرياض، المملكة العربية السعودية</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Phone className="w-8 h-8 text-primary" />
              <span className="font-semibold text-lg">خدمة العملاء</span>
              <span className="text-muted-foreground" dir="ltr">التواصل مع الدعم</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              <span className="font-semibold text-lg">البريد الإلكتروني</span>
              <span className="text-muted-foreground">support@riyadhstore.sa</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
