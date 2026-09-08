// Shared referral code validation utilities and seed codes

export const KNOWN_SEED_CODES = new Set([
  'CYATH-JOIN',
  'CYATH-PIONEER',
  'GUILD-2026',
  'CYATH-START',
  'CYATH-7K9P',
  'AVITO-2026',
]);

export interface ReferralValidationResult {
  valid: boolean;
  cleanCode?: string;
  error?: string;
}

/**
 * Extracts a clean referral code from a string that might be either a bare code
 * (e.g. "AVITE-RRYW") or a full URL/path (e.g. "https://www.cyath.space/auth?ref=AVITE-RRYW").
 */
export function extractReferralCode(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim();
  const refMatch = str.match(/[?&]ref=([^&#\s]+)/i);
  if (refMatch && refMatch[1]) {
    str = decodeURIComponent(refMatch[1]);
  } else if (str.includes('/')) {
    str = str.split('/').filter(Boolean).pop() || '';
  }
  return str.replace(/[^a-zA-Z0-9-]/g, '').trim().toUpperCase();
}

/**
 * Validates that an input is a genuine referral code and NOT a full website URL or invalid string.
 */
export function validateReferralCodeInput(input: unknown): ReferralValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Please enter a referral code.' };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Please enter a referral code.' };
  }

  // 1. Explicitly detect and reject web links / URLs / domains / query parameters
  const containsUrlPatterns =
    /^https?:\/\//i.test(trimmed) ||
    trimmed.includes('/') ||
    trimmed.includes('?') ||
    trimmed.includes('&') ||
    trimmed.includes('=') ||
    trimmed.includes('@') ||
    trimmed.includes(' ') ||
    /\.(space|com|app|io|net|org|co|dev|me)\b/i.test(trimmed);

  if (containsUrlPatterns) {
    return {
      valid: false,
      error: 'Please enter only the referral code (e.g. CYATH-7K9P), not a website link.',
    };
  }

  const cleanCode = trimmed.toUpperCase();

  // 2. Length restrictions
  if (cleanCode.length < 4 || cleanCode.length > 24) {
    return {
      valid: false,
      error: 'Referral codes are between 4 and 24 characters long.',
    };
  }

  // 3. Alphanumeric with optional single hyphen format
  const validCodeRegex = /^[A-Z0-9]{2,12}(-[A-Z0-9]{2,12})?$/;
  if (!validCodeRegex.test(cleanCode)) {
    return {
      valid: false,
      error: 'Invalid code format. Codes look like ALEX-8K9L or CYATH-JOIN.',
    };
  }

  return {
    valid: true,
    cleanCode,
  };
}
