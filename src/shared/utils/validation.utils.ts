/**
 * Validation utility functions.
 * Port of validationService.js and studentIdTest.js.
 */

/** RFC-compliant email validation regex */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate email format */
export function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Israeli ID checksum validation (Luhn-variant / Mispar Zehut algorithm).
 * Returns `true` if the ID is INVALID (legacy naming: "notValidId").
 *
 * @param id - The ID number string
 * @param country - Country code (validation only applies to 'IL')
 * @param idZehut - Whether this is an ID Zehut field (enables validation)
 * @returns `true` if the ID is invalid, `false` if valid
 */
export function notValidId(
  id: string,
  country?: string,
  idZehut?: boolean,
): boolean {
  // Only validate for Israel
  if (country !== "IL" && !idZehut) return false;
  if (!id) return true;

  // Pad to 9 digits
  const padded = id.padStart(9, "0");
  if (padded.length !== 9) return true;

  // Luhn-variant checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(padded[i], 10);
    if (isNaN(digit)) return true;

    let val = digit * ((i % 2) + 1);
    if (val > 9) val -= 9;
    sum += val;
  }

  return sum % 10 !== 0;
}
