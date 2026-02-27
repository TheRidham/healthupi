// components/steps/Step0Account.tsx  ← NEW FILE
"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { FormField, inputCls } from "../FormField"
import { DoctorFormData } from "@/lib/type"
import { cn } from "@/lib/utils"

interface Props {
  form: DoctorFormData
  set: (key: keyof DoctorFormData, value: any) => void
}

export function Step0Account({ form, set }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)

  const passwordsMatch = form.confirmPassword === "" || form.password === form.confirmPassword

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        Create Your Account
      </h2>
      <p className="text-sm text-muted-foreground -mt-2">
        Almost done! Create your account to save your profile and get started.
      </p>

      {/* Email */}
      <FormField label="Email Address" required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="dr.mitchell@example.com"
            className={cn(inputCls, "pl-9")}
            required
            autoComplete="email"
          />
        </div>
      </FormField>

      {/* Password */}
      <FormField label="Password" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Min 8 characters"
            className={cn(inputCls, "pl-9 pr-10")}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FormField>

      {/* Confirm Password */}
      <FormField label="Confirm Password" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="Re-enter your password"
            className={cn(
              inputCls, "pl-9 pr-10",
              !passwordsMatch && "border-destructive focus:border-destructive"
            )}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {!passwordsMatch && (
          <p className="text-xs text-destructive mt-1">Passwords do not match</p>
        )}
        {passwordsMatch && form.confirmPassword && (
          <p className="text-xs text-accent mt-1">✓ Passwords match</p>
        )}
      </FormField>

      <p className="text-xs text-muted-foreground pt-1">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

