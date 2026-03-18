/**
 * Student / Attendee domain types.
 * Extracted from students reducer state (redux-store.md §3.3)
 * and attendeesService documentation (services-layer.md §1.1 Attendees).
 */

import type { CheckinMethod } from "@/config/constants";

/** Core student/attendee entity */
export interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
  attendeeid?: string;
  /** Student ID (e.g., university ID number) */
  studentId?: string;
  /** Course enrollment */
  courseId?: string;
  /** Check-in status per session */
  checkins?: StudentCheckin[];
  /**
   * Session attendance map: sessionId → checkin data.
   * This comes from the API response for getCourseStudents.
   */
  sessions?: Record<string, { method?: string; request?: string; time?: number; location?: any }>;
  /** Total attendance count */
  attendanceCount?: number;
  /** Total sessions count */
  sessionsCount?: number;
  /** Attendance percentage */
  attendanceRate?: number;
  /** Number of sessions attended */
  sessionsAttended?: number;
  /** Whether the student was added manually */
  attendee_manual?: boolean;
}

/** Student check-in record for a single session */
export interface StudentCheckin {
  sessionId: string;
  checkedIn: boolean;
  method?: CheckinMethod;
  time?: number;
  /** Location data for verified check-ins */
  location?: {
    lat: number;
    lng: number;
  };
  /** Location verification status */
  locationStatus?: "verified" | "remote" | "undetected";
}

/** Attendee creation payload */
export interface CreateAttendeePayload {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  courseId: string;
}

/** Attendee update payload */
export interface UpdateAttendeePayload {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  attendeeid?: string;
  policy_accepted?: boolean;
  [key: string]: unknown;
}

/** Attendee verification payload */
export interface VerifyAttendeePayload {
  id: string;
  code: string;
}

/** Attendee code request payload */
export interface AttendeeCodePayload {
  _id?: string;
  phone?: string;
  email?: string;
  name?: string;
  sessionId?: string;
}
