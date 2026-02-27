// components/steps/Step4Contact.tsx
"use client"
import { Input } from "@/components/ui/input"
import { FormField, inputCls } from "../FormField"
import { TagInput } from "../TagInput"
import { DoctorFormData } from "@/lib/type"

interface Props {
  form: DoctorFormData
  set: (key: keyof DoctorFormData, value: any) => void
}

export function Step4Contact({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Contact Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone Number" required>
          <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (415) 555-0192" className={inputCls} />
        </FormField>

        <FormField label="Email Address" required>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="dr.mitchell@healthupi.com" className={inputCls} />
        </FormField>
      </div>

      <FormField label="Website">
        <Input type="url" value={form.website} onChange={(e) => set("website", e.target.value)}
          placeholder="https://www.mitchellcardiology.com" className={inputCls} />
      </FormField>

      <FormField label="Languages Spoken (press Enter or + to add)">
        <TagInput
          tags={form.languages}
          setTags={(v) => set("languages", v)}
          placeholder="e.g. English, Spanish, Hindi..."
        />
      </FormField>
    </div>
  )
}