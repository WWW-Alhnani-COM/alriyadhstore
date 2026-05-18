import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export function ImageUpload({ value, onChange, onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح");
      return;
    }

    // التحقق من الحجم (حد أقصى 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة لا يتجاوز 5 ميغابايت");
      return;
    }

    // عرض معاينة مؤقتة
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      if (onUpload) {
        // رفع إلى الخادم
        const imageUrl = await onUpload(file);
        onChange(imageUrl);
        setPreview(imageUrl);
      } else {
        // تحويل إلى Base64 للتخزين المؤقت
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onChange(base64String);
          setPreview(base64String);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("فشل رفع الصورة:", error);
      alert("حدث خطأ أثناء رفع الصورة");
      setPreview(value);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
          <img
            src={preview}
            alt="معاينة المنتج"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin mb-4" />
          ) : (
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          )}
          <p className="text-sm text-muted-foreground">
            انقر لاختيار صورة المنتج
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF (حد أقصى 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
