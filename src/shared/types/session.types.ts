/**
 * Session domain types.
 * Extracted from sessions reducer state (redux-store.md §3.2)
 * and sessionService.js documentation (services-layer.md §2.2).
 */

import type { CheckinMethod } from "@/config/constants";

/** Session status lifecycle */
export type SessionStatus = "active" | "ended" | "paused" | "scheduled";

/** Session mode */
export type SessionMode = "manual" | "auto";

/** Core session entity */
export interface Session {
  id: string;
  courseId: string;
  name: string;
  status: SessionStatus;
  mode: SessionMode;
  /** Short ID for attendee lookup */
  shortId?: string;
  /** Display numbering (reverse-indexed) */
  serialId?: number;
  /** Label / type identifier */
  label?: string;
  /** Session start time */
  begins: number;
  /** Session end time */
  ends?: number;
  /** Duration in minutes */
  duration?: number;
  /** Number of check-ins */
  checkins?: number;
  /** Total enrolled students */
  totalStudents?: number;
  /** Attendance percentage */
  attendanceRate?: number;
  /** QR code data */
  codes?: SessionCodes;
  /** Created timestamp */
  createdAt?: number;
}

/**
 * Live session data stored in localStorage("_session_") by StartSessionDialog.
 * Matches the exact shape from legacy StartSession.js finalize() method.
 */
export interface LiveSessionData {
  id: string;
  shortid: string;
  courseid: string;
  coursename: string;
  name: string;
  duration: number;
  begins: string | number;
  checkins: number;
  language: string;
  theme: {
    bgColor?: string;
    image?: string;
  };
  ivrEnabled: boolean;
  iconQuizEnabled: boolean;
  mode: SessionMode;
  qrinterval?: number;
  location?: {
    latLng?: { lat: number; lng: number };
    locationText?: string;
    radius?: number;
  };
  icongroup?: string;
  /** Initial attendee count (from creation / resume) */
  initialCount?: number;
  /** Counter of students already checked-in at session start */
  counter?: number;
}

/** QR code data embedded in session */
export interface SessionCodes {
  current: {
    code: string;
    icon: string;
  };
  previous?: {
    code: string;
    icon: string;
  };
}

/** Auto-mode session (simplified) */
export interface AutoSession {
  id: string;
  courseId: string;
  courseName?: string;
  begins: number; // timestamp
  ends?: number;
  label?: string;
  name?: string;
  room?: string;
  duration?: number;
  status: SessionStatus;
  mode: SessionMode;
}

/** Late check-in request */
export interface CheckinRequest {
  id: string;
  sessionId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  requestTime: number;
  /** 'pending' | 'approved' | 'denied' */
  status: string;
}

/** Stored session info (encrypted in localStorage for minimized window sync) */
export interface StoredSessionInfo {
  sessionId: string;
  courseId?: string;
  qrImage?: string;
  /** Formatted remaining time string, e.g. "29:56" */
  remainingText?: string;
  /** Raw remaining time in seconds */
  remainingTime?: number;
  /** Number of students checked in */
  checkedIn?: number;
  /** Legacy: count of checkins */
  checkinCount?: number;
  mode?: SessionMode;
  /** Whether icon quiz is enabled */
  iconQuizEnabled?: boolean;
}

/** Session activity data (encrypted in localStorage) */
export interface SessionActivityData {
  userId: string;
  keepLoggedIn: boolean;
  timestamp: number;
}

/** Check-in payload for check/uncheck operations */
export interface CheckinPayload {
  courseId: string;
  sessionId: string;
  /** true = check in, false = uncheck */
  checkin: boolean;
  attendeeid: string;
  method: CheckinMethod;
  code?: string;
  icon?: number;
  name?: string;
  email?: string;
  attendee_manual?: boolean;
  /** GPS coordinates for location-verified check-in */
  location?: {
    lat: number;
    lng: number;
  };
}
