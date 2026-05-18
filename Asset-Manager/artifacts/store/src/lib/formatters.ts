export const formatCurrency = (value: number): string => {
  // تنسيق الرقم بالريال السعودي
  const formatted = new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  // تأكد من استبدال الفاصلة العشرية العربية (٫) بالنقطة (.) إذا لزم الأمر
  // في بعض المتصفحات، Intl.NumberFormat قد يستخدم (٫) كفاصلة عشرية
  return formatted.replace(/٫/g, '.');
};

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};
