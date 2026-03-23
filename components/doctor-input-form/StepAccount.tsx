"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import type { DoctorFormData } from "./Doctoronboarding";

type Props = {
  data: DoctorFormData;
  updateFields: (fields: Partial<DoctorFormData>) => void;
};

export default function StepAccount({ data, updateFields }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== data.account_password;
  const passwordWeak = data.account_password.length > 0 && data.account_password.length < 8;

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Almost there!</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Create your login credentials. You'll use these to access your dashboard.
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="account_email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="account_email"
          type="email"
          placeholder="doctor@example.com"
          value={data.account_email}
          onChange={(e) => updateFields({ account_email: e.target.value })}
          required
          autoComplete="email"
        />
        <p className="text-xs text-gray-400">This will be your login email.</p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="account_password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="account_password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={data.account_password}
            onChange={(e) => updateFields({ account_password: e.target.value })}
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordWeak && (
          <p className="text-xs text-red-500">Password must be at least 8 characters.</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordMismatch && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}
      </div>

      {/* Password strength hints */}
      {data.account_password.length >= 8 && !passwordMismatch && confirmPassword === data.account_password && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
        </p>
      )}
    </div>
  );
}