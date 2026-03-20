/**
 * Course domain types.
 * Extracted from courses reducer state (redux-store.md §3.1)
 * and courseService.js documentation (services-layer.md §2.1).
 */

/** Course type discriminator */
export type CourseType = "classroom" | "field" | "hybrid";

/** Course status */
export type CourseStatus = "active" | "inactive" | "hidden";

/** Core course entity */
export interface Course {
  id: string;
  name: string;
  hostId: string;
  type: CourseType;
  status: CourseStatus;
  /** Institution/organization name */
  institute?: string;
  color?: string;
  /** Group/faculty this course belongs to */
  groupId?: string;
  /** Whether dynamic attendee adding is locked */
  locked?: boolean;
  /** Language for this course (overrides host default) */
  language?: string;
  /** Location settings */
  location?: CourseLocation;
  /** Session notification settings */
  sessionStartNotification?: boolean;
  /** Total number of sessions */
  sessionsCount?: number;
  /** Total number of enrolled students */
  studentsCount?: number;
  /** Max attendees count (from API, used for attendance rate calculation) */
  maxattendance?: number;
  /** Course start timestamp */
  begins?: number;
  /** Created timestamp */
  createdAt?: number;
  /** Updated timestamp */
  updatedAt?: number;
  /** Year */
  year?: number;
  /** Academic Term */
  term?: string;
  /** Internal ID / School ID */
  internalid?: string;
  /** Course Description */
  description?: string;
  /** IVR Phone Check-in Enabled */
  ivrenabled?: boolean;
  /** Post Check-in Success Message/URL */
  postCheckinUrl?: PostCheckinUrlData | string;
  /** Whether this is a field/shift check-in course */
  fieldCheckin?: boolean;
  /** Faculty / department ID */
  faculty?: string;
  /** Auto-mode room assignment */
  room?: string;
  /** Lock dynamic attendee joining */
  lockDynamicAddingAttendees?: boolean;
  /** Session start notification enabled for this course */
  sessionStartNotificationEnabled?: boolean;
  /** Icon quiz enabled (default true) */
  iconQuizEnabled?: boolean;
  /** Course type discriminator sent by API */
  courseType?: string;
}

export interface CourseLocation {
  lat: number;
  lng: number;
  radius?: number;
  address?: string;
}

/** Post check-in URL data (message + URL pair) */
export interface PostCheckinUrlData {
  message: string;
  url: string;
}

/** Course template for group-managed courses */
export interface CourseTemplate {
  _id: string;
  id: string;
  groupId: string;
  name: string;
  type?: CourseType;
  language?: string;
  location?: CourseLocation;
  ivrenabled?: boolean;
  iconQuizEnabled?: boolean;
  postCheckinUrl?: PostCheckinUrlData | string;
  settings?: Record<string, unknown>;
}

/** Field check-in record — matches API response shape */
export interface FieldCheckin {
  _id: string;
  courseId: string;
  /** Attendee/student ID */
  attendeeId: string;
  /** Shift check-in timestamp (ms epoch) */
  checkedInAt: number;
  /** Shift check-out timestamp (ms epoch) */
  checkedOutAt?: number;
  /** Duration in minutes (computed from checkedOutAt - checkedInAt) */
  duration?: number;
  /** Check-in location data */
  checkInLocation?: {
    latLng?: { lat: number; lng: number };
  };
  /** Check-out location data */
  checkOutLocation?: {
    latLng?: { lat: number; lng: number };
  };
  /** Check-in selfie URL */
  inSelfie?: string;
  /** Check-out selfie URL */
  outSelfie?: string;
  /** Auto checked-out flag */
  autoCheckedOut?: boolean;
  /** Late request status: pending | approved | denied */
  request?: string;
  /** Reason for late check-in */
  reason?: string;
}
