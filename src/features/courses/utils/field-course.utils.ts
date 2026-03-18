/**
 * Field course utilities — extracted from FieldCourseStudents.tsx.
 * Pure functions for field-checkin data processing.
 */

import { differenceInMinutes } from "date-fns";
import { theme } from "@/config/theme";
import type { FieldCheckin } from "@/shared/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudentData {
  id: string;
  name: string;
  checkins: FieldCheckin[];
  totalShiftsDuration: number;
}

export interface FieldInitResult {
  months: Date[];
  currentMonth: Date;
  studentsData: StudentData[];
  datesRow: Date[];
}

// ---------------------------------------------------------------------------
// minutesToHourMinute — identical to legacy dateServices
// ---------------------------------------------------------------------------
export function minutesToHourMinute(
  minutes: number,
  hStr = "hrs",
  mStr = "min",
): string {
  if (isNaN(minutes)) return "-";
  const min = Math.round(minutes % 60);
  const hours = Math.floor(minutes / 60);
  let hoursText = "";
  let minutesText = "";
  if (hours === 1) hoursText = `1 ${hStr}`;
  else if (hours > 1) hoursText = `${hours} ${hStr}`;
  if (min === 1) minutesText = `1 ${mStr}`;
  else minutesText = `${min} ${mStr}`;
  return `${hoursText} ${minutesText}`.trim();
}

// ---------------------------------------------------------------------------
// getFieldCheckinStatus — identical to legacy fieldCourseService.js
// ---------------------------------------------------------------------------
export function getFieldCheckinStatus(checkin: FieldCheckin): {
  status: string;
  color: string;
} {
  let status = "OK";
  let color: string = theme.colors.field.ok;
  if (checkin.request === "pending") {
    status = "Late checkin pending";
    color = theme.colors.field.pending;
  }
  if (checkin.request === "approved") status = "Late check-in approved";
  if (checkin.request === "denied") {
    status = "Late checkin denied";
    color = theme.colors.field.denied;
  }
  if (!checkin.checkedOutAt) {
    status = "Open shift";
    color = theme.colors.field.pending;
  }
  return { status, color };
}

// ---------------------------------------------------------------------------
// initFieldData — identical to legacy fieldCourseService.initData
// ---------------------------------------------------------------------------
export function initFieldData(
  students: Array<{
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  }>,
  checkins: FieldCheckin[],
): FieldInitResult {
  let firstDate: number | null = null;

  const sD: StudentData[] = students.map((student) => {
    const data: StudentData = {
      id: student.id,
      name:
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      checkins: [],
      totalShiftsDuration: 0,
    };
    if (!checkins || !checkins.length) return data;
    checkins.forEach((checkin) => {
      if (!firstDate || checkin.checkedInAt < firstDate) {
        firstDate = checkin.checkedInAt;
      }
      if (checkin.attendeeId === student.id) {
        if (checkin.checkedOutAt && !checkin.duration) {
          checkin.duration = differenceInMinutes(
            new Date(checkin.checkedOutAt),
            new Date(checkin.checkedInAt),
          );
        }
        data.checkins.push(checkin);
      }
    });
    return data;
  });

  // Compute totalShiftsDuration per student
  sD.forEach((student) => {
    let total = 0;
    student.checkins.forEach((c) => {
      if (c.duration) total += c.duration;
    });
    student.totalShiftsDuration = total;
  });

  // Sort by name
  sD.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));

  // Calculate date range (from first checkin to end of current month)
  let startDate: Date;
  if (firstDate) {
    startDate = new Date(firstDate);
  } else {
    startDate = new Date();
  }
  const initialDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // last day of current month

  // Build datesRow — every day from initial to end
  const datesRow: Date[] = [];
  const cursor = new Date(initialDate);
  while (cursor <= endDate) {
    datesRow.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Build months array
  const months: Date[] = [];
  const monthCursor = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );
  while (monthCursor <= endDate) {
    months.push(new Date(monthCursor));
    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  const currentMonth = months[months.length - 1] || new Date();

  return { months, currentMonth, studentsData: sD, datesRow };
}

// ---------------------------------------------------------------------------
// Haversine distance
// ---------------------------------------------------------------------------
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
export function areDatesOnSameDay(
  d1: number | Date,
  d2: number | Date,
): boolean {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isEndOfWeek(date: Date): boolean {
  return date.getDay() === 0; // Sunday = end of week
}

export function isEndOfMonth(date: Date): boolean {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay.getDate() === 1;
}
