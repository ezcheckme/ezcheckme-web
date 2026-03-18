/**
 * Number and string formatting utilities.
 * Port of formatNumbers.js and getStudentIdService.js.
 */

/** Add comma separators to numbers (e.g., 1000 → "1,000") */
export function numberWithCommas(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Mask a student ID to show only trailing N digits.
 * If `digitsToShow` is 0 or undefined, returns the full ID.
 *
 * @param studentId - The full student ID
 * @param digitsToShow - Number of trailing digits to show (from user settings)
 * @returns Masked ID string (e.g., "***1234")
 */
export function getStudentId(
  studentId: string | undefined,
  digitsToShow?: number,
): string {
  if (!studentId) return "";
  if (!digitsToShow || digitsToShow <= 0) return studentId;
  if (studentId.length <= digitsToShow) return studentId;

  const masked = "*".repeat(studentId.length - digitsToShow);
  const visible = studentId.slice(-digitsToShow);
  return `${masked}${visible}`;
}
