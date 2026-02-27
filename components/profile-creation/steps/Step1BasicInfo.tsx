"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { User, Upload } from "lucide-react"
import { FormField, inputCls, selectTriggerCls } from "../FormField"
import { DoctorFormData } from "@/lib/type"

interface Props {
  form: DoctorFormData
  set: (key: keyof DoctorFormData, value: any) => void
}

export function Step1BasicInfo({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Basic Information
      </h2>

      {/* Photo Upload */}
      <FormField label="Profile Photo">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
            {form.photo
              ? <img src={URL.createObjectURL(form.photo)} alt="preview" className="w-full h-full object-cover" />
              : <User className="w-6 h-6 text-muted-foreground" />
            }
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => set("photo", e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition text-sm">
              <Upload className="w-4 h-4" /> Upload Photo
            </div>
          </label>
        </div>
      </FormField>

      {/* Title + Designation */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Title">
          <Select value={form.title} onValueChange={(v) => set("title", v)}>
            <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Designation">
          <Input value={form.designation} onChange={(e) => set("designation", e.target.value)}
            placeholder="Senior Consultant" className={inputCls} />
        </FormField>
      </div>

      {/* First + Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
            placeholder="Andrew" className={inputCls} required />
        </FormField>
        <FormField label="Last Name" required>
          <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
            placeholder="Mitchell" className={inputCls} required />
        </FormField>
      </div>

      {/* About */}
      <FormField label="About / Bio">
        <Textarea value={form.about} onChange={(e) => set("about", e.target.value)}
          placeholder="Experienced cardiologist with over 15 years of practice..."
          rows={4} className={`${inputCls} resize-none`} />
      </FormField>
    </div>
  )
}