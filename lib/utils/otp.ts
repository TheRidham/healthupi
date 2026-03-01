// ============================================================================
// OTP UTILITIES (STUB IMPLEMENTATION FOR DEVELOPMENT)
// ============================================================================

// Store OTPs in memory for development (use localStorage for persistence)
const otpStorage: Map<string, { otp: string; expiresAt: number }> = new Map()

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP for a phone number (development stub)
 * In production, this would send SMS via Twilio, Firebase, etc.
 */
export function storeOtp(phone: string, otp?: string): string {
  const generatedOtp = otp || generateOtp()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes from now

  otpStorage.set(phone, { otp: generatedOtp, expiresAt })

  // Also store in localStorage for page refresh persistence
  try {
    localStorage.setItem(`otp_${phone}`, JSON.stringify({
      otp: generatedOtp,
      expiresAt
    }))
  } catch (error) {
    console.error('Failed to store OTP in localStorage:', error)
  }

  return generatedOtp
}

/**
 * Verify OTP for a phone number
 * In development: Accept ANY 6-digit code for quick testing
 * In production: Match the stored OTP
 */
export function verifyOtp(phone: string, otp: string): { valid: boolean; message: string } {
  // Development mode: Accept any 6-digit OTP
  if (process.env.NODE_ENV === 'development') {
    // Clean OTP to digits only
    const cleanOtp = otp.replace(/\D/g, '')

    if (cleanOtp.length === 6) {
      return { valid: true, message: 'OTP verified (development mode)' }
    }

    return { valid: false, message: 'Please enter a valid 6-digit OTP' }
  }

  // Production mode: Check against stored OTP
  const stored = otpStorage.get(phone)

  // Check localStorage if not in memory
  let storedData = stored
  if (!stored) {
    try {
      const localStorageData = localStorage.getItem(`otp_${phone}`)
      if (localStorageData) {
        storedData = JSON.parse(localStorageData)
      }
    } catch (error) {
      console.error('Failed to read OTP from localStorage:', error)
    }
  }

  if (!storedData) {
    return { valid: false, message: 'OTP expired or not found. Please request a new one.' }
  }

  // Check if expired
  if (Date.now() > storedData.expiresAt) {
    // Clean up expired OTP
    otpStorage.delete(phone)
    localStorage.removeItem(`otp_${phone}`)
    return { valid: false, message: 'OTP has expired. Please request a new one.' }
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP. Please try again.' }
  }

  // Clean up verified OTP
  otpStorage.delete(phone)
  localStorage.removeItem(`otp_${phone}`)

  return { valid: true, message: 'OTP verified successfully' }
}

/**
 * Clear stored OTP for a phone number
 */
export function clearOtp(phone: string): void {
  otpStorage.delete(phone)
  localStorage.removeItem(`otp_${phone}`)
}

/**
 * Check if an OTP exists and is still valid
 */
export function hasValidOtp(phone: string): boolean {
  const stored = otpStorage.get(phone)

  if (!stored) {
    try {
      const localStorageData = localStorage.getItem(`otp_${phone}`)
      if (localStorageData) {
        const data = JSON.parse(localStorageData)
        return Date.now() <= data.expiresAt
      }
    } catch (error) {
      return false
    }
    return false
  }

  return Date.now() <= stored.expiresAt
}

/**
 * Get time remaining for OTP (in seconds)
 */
export function getOtpTimeRemaining(phone: string): number {
  const stored = otpStorage.get(phone)

  if (!stored) {
    try {
      const localStorageData = localStorage.getItem(`otp_${phone}`)
      if (localStorageData) {
        const data = JSON.parse(localStorageData)
        const remaining = Math.max(0, data.expiresAt - Date.now())
        return Math.floor(remaining / 1000)
      }
    } catch (error) {
      return 0
    }
    return 0
  }

  return Math.max(0, Math.floor((stored.expiresAt - Date.now()) / 1000))
}
