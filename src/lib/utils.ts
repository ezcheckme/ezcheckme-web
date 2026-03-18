/**
 * Utility functions for className merging.
 * Uses clsx for conditional classes + tailwind-merge for deduplication.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with Tailwind CSS deduplication */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
