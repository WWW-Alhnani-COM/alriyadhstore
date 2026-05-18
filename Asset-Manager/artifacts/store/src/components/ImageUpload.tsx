// components/MultiImageUpload.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({ value = [], onChange, maxImages = 5 }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previews.length > maxImages) {
      alert(`يمكنك رفع ${maxImages} صور كحد أقصى`);
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("الرجاء اختيار ملف صورة صالح");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة لا يتجاوز 5 ميغابايت");
        continue;
      }

      // تحويل إلى Base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const newPreviews = [...previews, base64];
      setPreviews(newPreviews);
      onChange(newPreviews);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
              <img src={preview} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {previews.length < maxImages && (
          <div
            className="aspect-square rounded-lg border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">رفع صورة</span>
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        يمكنك رفع حتى {maxImages} صور (PNG, JPG, GIF - حد أقصى 5MB لكل صورة)
      </p>
    </div>
  );
}
