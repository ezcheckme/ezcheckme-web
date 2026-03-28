/**
 * FormattedDate
 * Mirrors legacy FormattedDate.js.
 * Renders a Date value in a specified format using date-fns.
 */

import { format as formatDate } from "date-fns";

interface FormattedDateProps {
  date: string | number | Date;
  format?: string;
  className?: string;
}

export function FormattedDate({
  date,
  format = "MMM dd, yyyy",
  className,
}: FormattedDateProps) {
  let displayValue = "—";
  try {
    const d = date instanceof Date ? date : new Date(date);
    displayValue = formatDate(d, format);
  } catch {
    // Valid fallback already set
  }
  return <span className={className}>{displayValue}</span>;
}
