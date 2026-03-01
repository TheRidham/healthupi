// ============================================================================
// PHONE VALIDATION & FORMATTING UTILITIES
// ============================================================================

/**
 * Validate Indian phone number
 * Accepts formats: 9876543210, +919876543210, +91 98765 43210
 */
export function validateIndianPhone(phone: string): boolean {
  if (!phone) return false

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
  const indianMobileRegex = /^[6-9]\d{9}$/

  // If starts with 91, remove country code and check the remaining 10 digits
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return indianMobileRegex.test(cleaned.slice(2))
  }

  return indianMobileRegex.test(cleaned)
}

/**
 * Format phone number for display
 * Converts: 9876543210 → +91 98765 43210
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    // Format as: +91 98765 43210
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }

  return phone // Return original if format is unexpected
}

/**
 * Format phone number for database storage
 * Returns: +919876543210 (no spaces, with country code)
 */
export function formatPhoneForDB(phone: string): string {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`
  }

  return cleaned // Return cleaned version if format is unexpected
}

/**
 * Check if two phone numbers are the same
 * Compares: +919876543210 == 9876543210
 */
export function arePhonesEqual(phone1: string, phone2: string): boolean {
  const clean1 = phone1.replace(/\D/g, '')
  const clean2 = phone2.replace(/\D/g, '')

  if (clean1 === clean2) return true

  if (clean1.length === 10 && clean2.length === 12 && clean2.startsWith('91')) {
    return clean1 === clean2.slice(2)
  }

  if (clean2.length === 10 && clean1.length === 12 && clean1.startsWith('91')) {
    return clean2 === clean1.slice(2)
  }

  return false
}
