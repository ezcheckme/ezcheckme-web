/**
 * Date utility functions.
 * 1:1 port of legacy dateServices.js (180 lines, 15 exports).
 */

import { differenceInSeconds, isSameDay, isSameMonth } from "date-fns";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Returns date formatted as DDMMYYYY string */
export function getFormattedDateToSend(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString();
  return `${d}${m}${y}`;
}

/** Returns current Date */
export function getNowDate(): Date {
  return new Date();
}

/** Returns a date N months from now */
export function getFutureInMonthDate(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Returns a date N weeks from startDate (or now if no startDate) */
export function getFutureInWeekDate(weeks: number, startDate?: Date): Date {
  const d = startDate ? new Date(startDate) : new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/** Returns the first day of the current month */
export function getFirstDayOfTheMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Format timestamp to "D-Mon-YYYY" (e.g., "5-Jan-2024") */
export function getFormattedDate(timestamp: number | Date): string {
  const d = new Date(timestamp);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

/** Format date to "YYYY.M.D HH.MM" */
export function getDateString(date: Date | number): string {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${hours}.${minutes}`;
}

/** Returns "H:MM" duration string from start/end timestamps */
export function getTimeDifferenceString(
  start: number | Date,
  end: number | Date,
): string {
  const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/** Returns { hours, minutes, seconds } from start/end timestamps */
export function getTimeDifferenceElements(
  start: number | Date,
  end: number | Date,
): { hours: number; minutes: number; seconds: number } {
  const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/** Check if two dates are on the same calendar day */
export function areDatesOnSameDay(
  d1: Date | number,
  d2: Date | number,
): boolean {
  return isSameDay(new Date(d1), new Date(d2));
}

/** Convert minutes to "X hours Y minutes" with localized labels */
export function minutesToHourMinute(
  totalMinutes: number,
  hLabel: string = "hours",
  mLabel: string = "minutes",
): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes} ${mLabel}`;
  if (minutes === 0) return `${hours} ${hLabel}`;
  return `${hours} ${hLabel} ${minutes} ${mLabel}`;
}

/** Convert minutes to "H:MM" format */
export function minutesToTime(totalMinutes: number, _text?: string): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/** Convert fractional day (e.g., 0.75) to "H:MM" */
export function fractionalDayToTime(fractionalDay: number): string {
  const totalMinutes = Math.round(fractionalDay * 24 * 60);
  return minutesToTime(totalMinutes);
}

/** Check if date is the last day of its month */
export function isEndOfMonth(date: Date): boolean {
  const test = new Date(date);
  test.setDate(test.getDate() + 1);
  return test.getMonth() !== date.getMonth();
}

/** Check if date is the last day of its week (Saturday) */
export function isEndOfWeek(date: Date): boolean {
  return date.getDay() === 6;
}

/** Check if two dates are in the same month */
export function areSameMonth(d1: Date | number, d2: Date | number): boolean {
  return isSameMonth(new Date(d1), new Date(d2));
}

/** Returns minutes since midnight for the current time */
export function minutesSinceMidnight(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Format duration in milliseconds to "mm:ss" */
export function formatDuration(durationInMs: number): string {
  const totalSeconds = Math.floor(durationInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/** Difference in seconds between two dates (using date-fns) */
export function getSecondsDifference(
  start: Date | number,
  end: Date | number,
): number {
  return differenceInSeconds(new Date(end), new Date(start));
}
