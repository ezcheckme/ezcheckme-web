/**
 * Shared constants for course configuration dialogs.
 * Separated from component file to satisfy react-refresh/only-export-components.
 */

export const LANGUAGES = [
  { value: "en", label: "English", icon: "format_textdirection_l_to_r" },
  { value: "es", label: "Spanish", icon: "format_textdirection_l_to_r" },
  { value: "pl", label: "Polish", icon: "format_textdirection_l_to_r" },
  { value: "he", label: "עברית", icon: "format_textdirection_r_to_l" },
  { value: "ar", label: "العربية", icon: "format_textdirection_r_to_l" },
];

const currentYear = new Date().getFullYear();
export const YEARS = [currentYear, currentYear + 1];

export const TERM_GROUPS = [
  {
    label: "Semesters",
    items: ["Semester A", "Semester B", "Summer Semester"],
  },
  {
    label: "Trimesters",
    items: ["Trimester 1", "Trimester 2", "Trimester 3"],
  },
  {
    label: "Quarters",
    items: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
  },
  {
    label: "Seasonal Semesters",
    items: ["Fall Semester", "Spring Semester", "Winter Semester"],
  },
];

export function validateCourseName(val: string): string {
  if (val.length > 0 && val.length < 3) return "Must be at least 3 characters";
  return "";
}

export function validateCourseDescription(val: string): string {
  if (val.length > 0 && val.length < 3) return "Must be at least 3 characters";
  return "";
}
