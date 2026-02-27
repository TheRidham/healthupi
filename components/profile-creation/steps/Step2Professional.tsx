"use client"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FormField, inputCls, selectTriggerCls } from "../FormField"
import { TagInput } from "../TagInput"
import { DoctorFormData } from "@/lib/type"

const SPECIALIZATIONS = [
  "Internal Medicine", "Cardiology", "Neurology", "Orthopedics",
  "Pediatrics", "Dermatology", "Oncology", "Psychiatry",
  "Radiology", "General Surgery", "Gynecology", "Urology",
]

interface Props {
  form: DoctorFormData
  set: (key: keyof DoctorFormData, value: any) => void
}

export function Step2Professional({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Professional Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Specialization" required>
          <Select value={form.specialization} onValueChange={(v) => set("specialization", v)}>
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Sub-specialization">
          <Input value={form.subSpecialization} onChange={(e) => set("subSpecialization", e.target.value)}
            placeholder="e.g. Interventional Cardiology" className={inputCls} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Years of Experience" required>
          <Input type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)}
            placeholder="15" min="0" max="60" className={inputCls} />
        </FormField>

        <FormField label="Registration No." required>
          <Input value={form.registrationNo} onChange={(e) => set("registrationNo", e.target.value)}
            placeholder="MED-2011-48293" className={inputCls} />
        </FormField>
      </div>

      <FormField label="Qualifications (press Enter or + to add)">
        <TagInput
          tags={form.qualifications}
          setTags={(v) => set("qualifications", v)}
          placeholder="e.g. MD, MBBS, FACC, Board Certified..."
        />
      </FormField>
    </div>
  )
}