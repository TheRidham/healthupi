// components/steps/Step5Additional.tsx
"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, inputCls, selectTriggerCls } from "../FormField";
import { DoctorFormData } from "@/lib/type";

interface Props {
  form: DoctorFormData;
  set: (key: keyof DoctorFormData, value: any) => void;
}

export function Step5Additional({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Additional Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Base Consultation Fee (Rs)">
          <Input
            type="number"
            value={form.baseFee}
            onChange={(e) => set("baseFee", e.target.value)}
            placeholder="500"
            min="0"
            className={inputCls}
          />
        </FormField>

        <FormField label="Availability Status">
          <Select
            value={form.availability}
            onValueChange={(v) => set("availability", v)}
          >
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">🟢 Online Now</SelectItem>
              <SelectItem value="busy">🟡 Busy</SelectItem>
              <SelectItem value="offline">🔴 Offline</SelectItem>
              <SelectItem value="by-appointment">📅 By Appointment</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Member Since">
          <Input
            type="date"
            value={form.memberSince}
            onChange={(e) => set("memberSince", e.target.value)}
            className={inputCls}
          />
        </FormField>
        <FormField label="Patients Served">
          <Input
            type="number"
            value={form.patientsServed}
            onChange={(e) => set("patientsServed", e.target.value)}
            placeholder="3200"
            className={inputCls}
          />
        </FormField>
        <FormField label="Rating (/ 5.0)">
          <Input
            type="number"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            placeholder="4.9"
            min="0"
            max="5"
            step="0.1"
            className={inputCls}
          />
        </FormField>
      </div>

      {/* Summary Preview */}
      <div className="mt-2 p-4 rounded-xl bg-muted/50 border">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
          Profile Summary
        </p>
        <div className="grid grid-cols-2 gap-y-2.5 text-sm">
          {[
            [
              "Name",
              `${form.title} ${form.firstName} ${form.lastName}`.trim() || "—",
            ],
            ["Specialization", form.specialization || "—"],
            ["Experience", form.experience ? `${form.experience} years` : "—"],
            ["Registration", form.registrationNo || "—"],
            ["City", form.city || "—"],
            ["Email", form.email || "—"],
            ["Base Fee", form.baseFee ? `Rs ${form.baseFee}` : "—"],
            ["Availability", form.availability],
          ].map(([label, value]) => (
            <span key={label} className="contents">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground text-right truncate">
                {value}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
