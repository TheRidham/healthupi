"use client"
import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { ImagePlus, X } from "lucide-react"
import { FormField, inputCls } from "../FormField"
import { DoctorFormData } from "@/lib/type"
import { cn } from "@/lib/utils"

interface Props {
  form: DoctorFormData
  set: (key: keyof DoctorFormData, value: any) => void
}

export function Step3Clinic({ form, set }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    // Max 6 photos
    const combined = [...form.clinicPhotos, ...newFiles].slice(0, 6)
    set("clinicPhotos", combined)
  }

  const removePhoto = (index: number) => {
    const updated = form.clinicPhotos.filter((_, i) => i !== index)
    set("clinicPhotos", updated)
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Clinic / Hospital
      </h2>

      <FormField label="Clinic Name">
        <Input
          value={form.clinicName}
          onChange={(e) => set("clinicName", e.target.value)}
          placeholder="Mitchell Cardiology Center"
          className={inputCls}
        />
      </FormField>

      <FormField label="Hospital / Affiliated Institute">
        <Input
          value={form.hospital}
          onChange={(e) => set("hospital", e.target.value)}
          placeholder="St. Mary's Medical Center"
          className={inputCls}
        />
      </FormField>

      <FormField label="Street Address">
        <Input
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="1234 Medical Plaza, Suite 200"
          className={inputCls}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="City">
          <Input value={form.city} onChange={(e) => set("city", e.target.value)}
            placeholder="San Francisco" className={inputCls} />
        </FormField>
        <FormField label="State">
          <Input value={form.state} onChange={(e) => set("state", e.target.value)}
            placeholder="California" className={inputCls} />
        </FormField>
        <FormField label="ZIP Code">
          <Input value={form.zip} onChange={(e) => set("zip", e.target.value)}
            placeholder="94102" className={inputCls} />
        </FormField>
      </div>

      {/* ── Clinic Photos ──────────────────────────────────── */}
      <FormField label={`Clinic Photos (${form.clinicPhotos.length}/6)`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
        />

        {/* Upload trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={form.clinicPhotos.length >= 6}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed transition-all duration-200 text-sm",
            form.clinicPhotos.length >= 6
              ? "border-border text-muted-foreground cursor-not-allowed"
              : "border-border text-foreground hover:border-primary hover:bg-accent cursor-pointer"
          )}
        >
          <ImagePlus className="w-6 h-6" />
          <span>
            {form.clinicPhotos.length >= 6
              ? "Maximum 6 photos reached"
              : "Click to upload clinic / operation room photos"}
          </span>
          <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</span>
        </button>

        {/* Preview Grid */}
        {form.clinicPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {form.clinicPhotos.map((file, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-muted border">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`clinic-${i}`}
                  className="w-full h-full object-cover"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/70 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-foreground truncate">{file.name}</p>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {form.clinicPhotos.length < 6 && Array.from({ length: 6 - form.clinicPhotos.length }).map((_, i) => (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent flex items-center justify-center transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </FormField>
    </div>
  )
}