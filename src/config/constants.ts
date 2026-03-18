/**
 * Application-wide constants.
 * API paths, encryption keys, localStorage keys, and UI constants.
 */

// ---------------------------------------------------------------------------
// API Path Constants — must match API Gateway resource paths exactly
// ---------------------------------------------------------------------------
export const API_PATHS = {
  COURSES: "/courses",
  SESSIONS: "/sessions",
  ATTENDEES: "/attendees",
  HOST: "/new_hosts",
  ADMIN: "/new_hosts", // admin endpoints share the /new_hosts path
  GROUPS: "/groups",
  CONFIG: "/new_config",
  FIELD_CHECKIN: "/field_checkin",
  OFFICE: "/office",
  EXPORT: "/export",
  BILLING: "/billing",
} as const;

// ---------------------------------------------------------------------------
// Encryption Keys — backward-compatible with existing API encryption
// ---------------------------------------------------------------------------
export const ENCRYPTION_KEYS = {
  /** Used for general data encryption (session info, contact forms, analytics) */
  INFO: "ezinfo007",
  /** Used for session activity data encryption */
  DATE: "ezdate007",
} as const;

// ---------------------------------------------------------------------------
// localStorage Keys — must match legacy app exactly for migration compat
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = {
  /** Host user ID from Cognito JWT */
  HOST_ID: "custom:hostid",
  /** Admin impersonation ID (takes precedence over HOST_ID when set) */
  IMPERSONATE_ID: "custom:impid",
  /** Attendee user ID */
  ATTENDEE_ID: "custom:attendeeid",
  /** Encrypted session activity data (login tracking) */
  SESSION_ACTIVITY: "_session_la_",
  /** Encrypted session info (QR image, remaining time, check-in count) */
  SESSION_INFO: "_session_info_",
  /** Session action flag (end_session / close_minimized) */
  SESSION_ACTION: "_session_action_",
  /** Auto-mode session duration preference */
  SESSION_DURATION: "_session_registration_length_",
  /** Auto-mode selected room */
  ROOM: "_room_",
  /** Reload after auto session flag */
  RELOAD_AFTER_SESSION: "_r_a_a_s_",
  /** Cookie consent */
  COOKIE_CONSENT: "cookie_consent",
} as const;

// ---------------------------------------------------------------------------
// Course Views — state machine constants for view navigation
// ---------------------------------------------------------------------------
export const COURSE_VIEWS = {
  DASHBOARD: "COURSE_DASHBOARD",
  SESSIONS: "COURSE_SESSIONS",
  STUDENTS: "COURSE_STUDENTS",
  FIELD_STUDENTS: "COURSE_FIELD_STUDENTS",
  MESSAGES: "COURSE_MESSAGES",
  SESSION_STUDENTS: "SESSION_STUDENTS",
  STUDENT_SESSIONS: "STUDENT_SESSIONS",
  STUDENT_FIELD_CHECKINS: "STUDENT_FIELD_CHECKINS",
} as const;

export type CourseView = (typeof COURSE_VIEWS)[keyof typeof COURSE_VIEWS];

// ---------------------------------------------------------------------------
// Admin Views
// ---------------------------------------------------------------------------
export const ADMIN_VIEWS = {
  MAIN_DASHBOARD: "ADMIN_MAIN_DASHBOARD",
  MAIN_DASHBOARD_COURSES: "ADMIN_MAIN_DASHBOARD_COURSES_VIEW",
  MAIN_DASHBOARD_HOSTS: "ADMIN_MAIN_DASHBOARD_HOSTS_VIEW",
  COURSES: "ADMIN_COURSES",
  HOSTS: "ADMIN_HOSTS",
  ATTENDEES: "ADMIN_ATTENDEES",
} as const;

export type AdminView = (typeof ADMIN_VIEWS)[keyof typeof ADMIN_VIEWS];

// ---------------------------------------------------------------------------
// User Roles
// ---------------------------------------------------------------------------
export const USER_ROLES = {
  UNKNOWN: "unknown",
  HOST: "host",
  ATTENDEE: "attendee",
  GUEST: "guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ---------------------------------------------------------------------------
// Check-in Methods
// ---------------------------------------------------------------------------
export const CHECKIN_METHODS = {
  QR: "qr",
  MANUAL: "MANUAL",
  GPS: "gps",
  SELFIE: "selfie",
  CODE: "code",
  LATE_REQUEST: "late_request",
  WAQUIZ: "WAQUIZ",
} as const;

export type CheckinMethod =
  (typeof CHECKIN_METHODS)[keyof typeof CHECKIN_METHODS];

// ---------------------------------------------------------------------------
// Supported Languages
// ---------------------------------------------------------------------------
export const LANGUAGES = {
  EN: "en",
  HE: "he",
  ES: "es",
  PL: "pl",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// ---------------------------------------------------------------------------
// Course Types — matches legacy config.courses
// ---------------------------------------------------------------------------
export const COURSE_TYPES = {
  CLASSROOM: "CLASSROOM",
  SHIFTS: "SHIFTS",
  CLASSROOM_COLOR: "#1E8229",
  SHIFTS_COLOR: "#276CB2",
} as const;

export type CourseType = "CLASSROOM" | "SHIFTS";

// ---------------------------------------------------------------------------
// Report Config — column indices (1-based for ExcelJS)
// ---------------------------------------------------------------------------
export const REPORT_CONFIG = {
  EMPTY_CELL_VALUE: "-",
  NOT_FOUND_CELL_VALUE: "-",
  STRING_MAX_LENGTH: 30,
  LAST_NAME_COL: 1,
  FIRST_NAME_COL: 2,
  EMAIL_COL: 3,
  PHONE_COL: 4,
  ID_COL: 5,
  ATTENDANCE_RATE_COL: 6,
  TOTAL_SHIFTS_COL: 6,
  ATTENDANCE_SESSIONS_COL: 7,
} as const;

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  DEFAULT_PAGE: 0,
} as const;

// ---------------------------------------------------------------------------
// Session Polling Intervals (ms)
// ---------------------------------------------------------------------------
export const POLLING = {
  AUTO_SESSIONS: 60_000,
  UPCOMING_SESSION_CHECK: 5_000,
  COUNTDOWN: 1_000,
} as const;
