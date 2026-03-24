"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, User } from "lucide-react";
import { createClientBrowser } from "@/lib/supabase/client";

type Props = {
  bucket: string; // e.g. "doctor-assets"
  folder: string; // e.g. "profile-photos"
  value: string; // current public URL (stored in form state)
  onChange: (url: string) => void;
  label?: string;
  shape?: "circle" | "rect";
  accept?: string;
};

export default function SingleImageUploader({
  bucket,
  folder,
  value,
  onChange,
  label = "Upload Photo",
  shape = "circle",
  accept = "image/*",
}: Props) {
  const supabase = createClientBrowser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop();
      const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { contentType: file.type});

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
      onChange(data.publicUrl);
    } catch (err: any) {
        console.log(err);
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const remove = () => onChange("");

  const isCircle = shape === "circle";

  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      <div
        className={cn(
          "flex",
          isCircle ? "items-center gap-4" : "flex-col gap-2",
        )}
      >
        {/* Preview */}
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt="Preview"
              className={cn(
                "object-cover border border-gray-200",
                isCircle ? "w-20 h-20 rounded-full" : "w-full h-36 rounded-xl",
              )}
            />
            <button
              type="button"
              onClick={remove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          isCircle && (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-gray-300" />
            </div>
          )
        )}

        {/* Drop zone */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors border-2 border-dashed rounded-xl px-4",
            isCircle ? "py-3 flex-1" : "py-6 w-full",
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 border-gray-300 hover:border-blue-400",
          )}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
          <p className="text-xs text-gray-500 text-center">
            {uploading
              ? "Uploading…"
              : value
                ? "Click to replace"
                : "Click or drag & drop"}
          </p>
          <p className="text-[11px] text-gray-400">PNG, JPG, WEBP · Max 5MB</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
