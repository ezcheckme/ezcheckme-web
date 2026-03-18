/**
 * Admin analytics domain types.
 * Extracted from admin reducer state (redux-store.md §3.8)
 * and adminService documentation (services-layer.md §1.1 Admin Analytics).
 */

/** Admin date range filter */
export interface AdminDateRange {
  from: string;
  to: string;
  timezone?: string;
}

/** Admin view type configuration */
export interface AdminViewConfig {
  /** Data display format */
  dataType: "PERCENT" | "COUNT";
  /** Date grouping */
  datesType: "DAY" | "WEEK" | "MONTH";
}

/** Admin UI elements visibility */
export interface AdminMainElementsView {
  adminMainGraphShow: boolean;
  adminMainStatsShow: boolean;
  adminMainTableShow: boolean;
}

/** General admin statistics */
export interface AdminGeneralStats {
  totalHosts?: number;
  totalCourses?: number;
  totalSessions?: number;
  totalAttendees?: number;
  totalCheckins?: number;
  attendanceRate?: number;
}

/** Course-level statistics row */
export interface AdminCourseStats {
  courseId?: string;
  _id?: string;
  courseName: string;
  hostName: string | string[];
  facultyName?: string | string[];
  sessions: number;
  activeAttendees: number;
  checkins: number;
  rate: number;
}

/** Host-level statistics row */
export interface AdminHostStats {
  hostId?: string;
  _id?: string;
  hostName: string | string[];
  email: string;
  courses: number;
  sessions: number;
  activeAttendees: number;
  checkins: number;
  rate?: number;
}

/** Graph data point for time series */
export interface AdminGraphDataPoint {
  date: string;
  value: number;
  label?: string;
}

/** Institute attendees statistics */
export interface InstituteAttendeesStats {
  classroomData: unknown[];
  fieldData: unknown[];
}

/** Attendee info (bulk fetch result) */
export interface AttendeeInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  courses: string[];
}

/** Host activity entry (super admin view) */
export interface HostActivity {
  hostId: string;
  hostName: string;
  email: string;
  lastActivity: number;
  sessionsCount: number;
}

/** Attendees by domain entry (super admin view) */
export interface AttendeesByDomain {
  domain: string;
  count: number;
  attendees: string[];
}

/** Admin filter configuration (for table filtering) */
export interface AdminTableFilter {
  key: string;
  label: string;
  type: "min" | "max";
  value: number;
}
