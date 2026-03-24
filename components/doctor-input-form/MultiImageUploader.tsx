"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClientBrowser } from "@/lib/supabase/client";

type Props = {
  bucket: string;         // e.g. "doctor-assets"
  folder: string;         // e.g. "clinic-photos"
  values: string[];       // current list of public URLs
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
};

export default function MultiImageUploader({
  bucket,
  folder,
  values,
  onChange,
  label = "Upload Photos",
  max = 6,
}: Props) {
  const supabase = createClientBrowser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = max - values.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} photos allowed.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    const oversized = toUpload.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setError("Each file must be under 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of toUpload) {
        const ext = file.name.split(".").pop();
        const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {  contentType: file.type });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
        uploadedUrls.push(data.publicUrl);
      }

      onChange([...values, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    onChange(values.filter((u) => u !== url));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const canAddMore = values.length < max;

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      {/* Thumbnail grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url) => (
            <div key={url} className="relative group aspect-video">
              <img
                src={url}
                alt="Clinic"
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — only shown if under max */}
      {canAddMore && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            uploading
              ? "opacity-50 cursor-not-allowed border-gray-300"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-500">Uploading…</p>
            </>
          ) : (
            <>
              <ImagePlus className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500 text-center">
                Click or drag & drop · up to {max - values.length} more photo{max - values.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-gray-400">PNG, JPG, WEBP · Max 5MB each</p>
            </>
          )}
        </div>
      )}

      {values.length >= max && (
        <p className="text-xs text-gray-400">Maximum {max} photos uploaded.</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}