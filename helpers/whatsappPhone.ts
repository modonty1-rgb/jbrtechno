/**
 * WhatsApp Phone Number Helper Functions
 * 
 * WhatsApp requires phone numbers in international format:
 * - Country code + phone number (no + sign, no spaces, no dashes)
 * - Example: 966501234567 (Saudi Arabia: +966 50 123 4567)
 * - Minimum length: 7 digits (some small countries)
 * - Maximum length: 15 digits (ITU-T E.164 standard)
 */

export interface PhoneValidationResult {
  valid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Formats a phone number for WhatsApp
 * Removes all non-digit characters and validates format
 * 
 * @param phoneNumber - Phone number in any format (with/without +, spaces, dashes)
 * @returns Formatted phone number (digits only) or empty string if invalid
 */
export function formatPhoneForWhatsApp(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Return empty if no digits found
  if (cleaned.length === 0) return '';

  return cleaned;
}

/**
 * Validates and formats a phone number for WhatsApp
 * 
 * @param phoneNumber - Phone number in any format
 * @returns Validation result with formatted number and error message if invalid
 */
export function validateWhatsAppPhone(phoneNumber: string | null | undefined): PhoneValidationResult {
  if (!phoneNumber) {
    return {
      valid: false,
      formatted: '',
      error: 'Phone number is required',
    };
  }

  const formatted = formatPhoneForWhatsApp(phoneNumber);

  if (formatted.length === 0) {
    return {
      valid: false,
      formatted: '',
      error: 'Phone number must contain at least one digit',
    };
  }

  // WhatsApp phone number rules:
  // - Minimum 7 digits (some small countries like Niue: 683)
  // - Maximum 15 digits (ITU-T E.164 standard)
  // - Must start with country code (1-3 digits typically)
  // - Cannot start with 0 (country codes don't start with 0)

  if (formatted.length < 7) {
    return {
      valid: false,
      formatted,
      error: 'Phone number is too short (minimum 7 digits required)',
    };
  }

  if (formatted.length > 15) {
    return {
      valid: false,
      formatted,
      error: 'Phone number is too long (maximum 15 digits allowed)',
    };
  }

  // Check if it starts with 0 (invalid for international format)
  if (formatted.startsWith('0')) {
    return {
      valid: false,
      formatted,
      error: 'Phone number cannot start with 0. Use country code format (e.g., 966 for Saudi Arabia)',
    };
  }

  return {
    valid: true,
    formatted,
  };
}

/**
 * Creates a WhatsApp URL with phone number and optional message
 * 
 * @param phoneNumber - Phone number (will be formatted automatically)
 * @param message - Optional message to pre-fill
 * @returns WhatsApp URL or empty string if phone is invalid
 */
export function createWhatsAppUrl(
  phoneNumber: string | null | undefined,
  message?: string
): string {
  const validation = validateWhatsAppPhone(phoneNumber);

  if (!validation.valid || !validation.formatted) {
    return '';
  }

  const baseUrl = `https://wa.me/${validation.formatted}`;

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }

  return baseUrl;
}

/**
 * Detects country code based on phone number pattern
 * - Saudi Arabia: Numbers starting with 05 (mobile) or 01 (landline) after removing 0
 * - Egypt: Numbers starting with 01 (mobile) or 02 (landline) after removing 0
 * 
 * @param phoneNumber - Phone number (digits only, may start with 0)
 * @returns Country code: '966' for Saudi Arabia, '20' for Egypt, or null if can't detect
 */
function detectCountryCode(phoneNumber: string): string | null {
  if (!phoneNumber || phoneNumber.length === 0) return null;

  // Remove leading 0 if present
  const withoutZero = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;

  if (withoutZero.length === 0) return null;

  // Saudi Arabia patterns:
  // - Mobile: 05xxxxxxxx (10 digits after removing 0)
  // - Landline: 01xxxxxxxx (10 digits after removing 0)
  if (withoutZero.startsWith('05') || withoutZero.startsWith('01')) {
    // Check if it's likely Saudi (10 digits after removing 0, or 9 digits)
    // Or Egypt (11 digits after removing 0)
    if (withoutZero.startsWith('01')) {
      // If starts with 01, could be Saudi landline or Egypt mobile
      // Saudi landlines are typically 01x (area code) + 7 digits = 10 total
      // Egypt mobiles are 01x (network) + 8 digits = 11 total
      if (withoutZero.length === 10) {
        return '966'; // Saudi Arabia
      } else if (withoutZero.length === 11) {
        return '20'; // Egypt
      }
    } else if (withoutZero.startsWith('05')) {
      // Saudi mobile numbers are typically 05x + 8 digits = 10 total
      if (withoutZero.length === 9 || withoutZero.length === 10) {
        return '966'; // Saudi Arabia
      }
    }
  }

  // Egypt patterns:
  // - Mobile: 01xxxxxxxxx (11 digits after removing 0)
  // - Landline: 02xxxxxxxx (10 digits after removing 0)
  if (withoutZero.startsWith('02')) {
    // Egypt landline: 02 (Cairo) + 8 digits = 10 total
    if (withoutZero.length === 10) {
      return '20'; // Egypt
    }
  }

  // If starts with 01 and is 11 digits, likely Egypt mobile
  if (withoutZero.startsWith('01') && withoutZero.length === 11) {
    return '20'; // Egypt
  }

  // Default: Try Saudi Arabia first (most common in this context)
  return '966';
}

/**
 * Validates and attempts to fix phone number, returns best available option
 * Automatically detects country (Saudi Arabia 966 or Egypt 20) based on number pattern
 * 
 * @param phoneNumber - Phone number to validate/fix
 * @param defaultCountryCode - Default country code to use if detection fails (default: 966)
 * @returns Validation result with fixed number if possible
 */
export function validateAndFixWhatsAppPhone(
  phoneNumber: string | null | undefined,
  defaultCountryCode: string = '966'
): PhoneValidationResult {
  if (!phoneNumber) {
    return {
      valid: false,
      formatted: '',
      error: 'Phone number is required',
    };
  }

  // First try to validate as-is
  let validation = validateWhatsAppPhone(phoneNumber);

  // If invalid and starts with 0, try to fix it with auto-detected country code
  if (!validation.valid) {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.startsWith('0') && digitsOnly.length > 1) {
      const formatted = formatPhoneForWhatsApp(phoneNumber);
      if (formatted.length > 0) {
        const withoutZero = formatted.substring(1);
        const countryCode = detectCountryCode(formatted) || defaultCountryCode;
        
        // Check if adding country code would make it valid (7-15 digits)
        const fixedNumber = `${countryCode}${withoutZero}`;
        if (fixedNumber.length >= 7 && fixedNumber.length <= 15) {
          // Validate the fixed number
          validation = validateWhatsAppPhone(fixedNumber);
        }
      }
    }
  }

  return validation;
}


