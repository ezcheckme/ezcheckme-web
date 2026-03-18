/**
 * Session domain service.
 * API methods for session lifecycle, check-ins, and data persistence.
 * Maps to legacy EZDataService session methods (services-layer.md §1.1).
 */

import { API_PATHS, ENCRYPTION_KEYS, STORAGE_KEYS } from "@/config/constants";
import { get, post, put, del, withHostId } from "./api-client";
import { setEncrypted, getEncrypted, removeItem, getEffectiveHostId } from "./storage";
import type {
  Session,
  AutoSession,
  CheckinRequest,
  StoredSessionInfo,
  SessionActivityData,
  CheckinPayload,
} from "@/shared/types";

// ---------------------------------------------------------------------------
// Session CRUD / Lifecycle
// ---------------------------------------------------------------------------

/** Start a live session — body format must match legacy createSession */
export function createSession(
  props: Record<string, unknown>,
): Promise<Session> {
  const hostid = getEffectiveHostId();
  if (!hostid) throw new Error("No host ID available");

  const course = props.course as Record<string, unknown> | undefined;
  const duration = (props.duration as number) || 0;

  const body = {
    hostid,
    courseid: course?.id ?? "",
    coursename: course?.name ?? "",
    begins: Date.now(),
    ends: Date.now() + duration * 6e4,
    name: props.name,
    description: props.description,
    duration,
    icongroup: props.icongroup,
    location: props.location,
    qrinterval: props.qrinterval,
    iconQuizEnabled: props.iconQuizEnabled,
  };

  return post<Session>(API_PATHS.SESSIONS, body);
}

/** Schedule a future session */
export function createFutureSession(
  props: Record<string, unknown>,
): Promise<Session> {
  return post<Session>(`${API_PATHS.SESSIONS}/future`, props);
}

/** Resume a paused session */
export function resumeSession(
  props: Record<string, unknown>,
  courseId: string,
  sessionId: string,
): Promise<Session> {
  // Server expects { action: "resume", data: { location } }
  // Passing raw props causes a 500 — confirmed from old app ezdataservice.js line 936-941
  return put<Session>(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}`, {
    action: "resume",
    data: {
      location: props.location,
    },
  });
}

/** Rename a session */
export function renameSession(
  courseId: string,
  sessionId: string,
  name: string,
): Promise<void> {
  return put<void>(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}`, {
    action: "update",
    data: { name },
  });
}

/** Push new QR code to session */
export function updateSessionCodes(
  courseId: string,
  sessionId: string,
  codes: { code: string; icon: string },
): Promise<unknown> {
  return put<unknown>(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}`, {
    action: "codes",
    data: {
      code: codes.code,
      icon: codes.icon,
    },
  });
}

/** End a session */
export function endSession(courseId: string, sessionId: string): Promise<void> {
  return put<void>(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}`, {
    action: "end",
  });
}

/** End session and verify attendees */
export function endSessionVerifyAttendees(
  courseId: string,
  sessionId: string,
  data?: unknown,
): Promise<void> {
  return post<void>(
    `${API_PATHS.SESSIONS}/end_verify/${courseId}/${sessionId}`,
    data,
  );
}

/** Delete a session */
export function deleteSession(
  courseId: string,
  sessionId: string,
): Promise<void> {
  return del<void>(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}`);
}

// ---------------------------------------------------------------------------
// Session Queries
// ---------------------------------------------------------------------------

/** List sessions for a course (sorted by date desc) */
export function getCourseSessions(courseId: string): Promise<Session[]> {
  return get<Session[]>(`${API_PATHS.SESSIONS}/${courseId}`);
}

/** List auto-mode sessions for a room */
export async function getAutoSessions(room: string): Promise<AutoSession[]> {
  const hostId = withHostId("{hostid}");
  const raw = await get<any[]>(`${API_PATHS.SESSIONS}/getautos/${hostId}/${room}`);
  // Map legacy API field names to our TypeScript interface
  return (raw || []).map((s: any) => ({
    id: s._id || s.id,
    courseId: s.courseid || s.courseId || "",
    courseName: s.coursename || s.courseName || "",
    begins: typeof s.begins === "string" ? new Date(s.begins).getTime() : s.begins,
    ends: s.ends,
    label: s.label,
    name: s.name,
    room: s.room,
    duration: s.duration,
    status: s.status || "pending",
    mode: s.mode || "auto",
  }));
}

/** Look up session by short ID */
export function getSessionByShortId(shortId: string): Promise<Session> {
  return get<Session>(`${API_PATHS.SESSIONS}/short/${shortId}`);
}

/** Get live check-in count for a session */
export function getSessionNumberOfCheckins(
  courseId: string,
  sessionId: string,
): Promise<{ count: number }> {
  return get(`${API_PATHS.SESSIONS}/getcheckins/${courseId}/${sessionId}`);
}

/** List session attendees */
export function getSessionStudents(
  courseId: string,
  sessionId: string,
): Promise<unknown[]> {
  return get(`${API_PATHS.SESSIONS}/${courseId}/${sessionId}/students`);
}

/** Approve/deny late check-in request */
export function handleLateRequestCheckin(
  data: unknown,
  sessionId: string,
): Promise<void> {
  return put<void>(
    `${API_PATHS.SESSIONS}/handle_late_request/${sessionId}`,
    data,
  );
}

/** Merge multiple sessions */
export function mergeSessions(data: {
  toId: string;
  fromIds: string[];
  courseId: string;
  method: string;
}): Promise<void> {
  return post<void>(`${API_PATHS.HOST}/merge_sessions`, data);
}

/** Generic session data update */
export function updateSessionData(
  data: unknown,
  sessionId: string,
): Promise<void> {
  return put<void>(`${API_PATHS.SESSIONS}/update/${sessionId}`, data);
}

// ---------------------------------------------------------------------------
// Check-in Operations
// ---------------------------------------------------------------------------

/** Check or uncheck a student in a session */
export function checkUncheck(payload: CheckinPayload): Promise<void> {
  const { courseId, sessionId, ...body } = payload;
  return post<void>(
    `${API_PATHS.SESSIONS}/${courseId}/${sessionId}`,
    body,
  );
}

/** Verify if an attendee is checked in */
export function isCheckedIn(
  courseId: string,
  sessionId: string,
  attendeeId: string,
): Promise<{ checkedIn: boolean }> {
  return get(
    `${API_PATHS.SESSIONS}/${courseId}/${sessionId}/verify/${attendeeId}`,
  );
}

/** Get all pending check-in requests across courses */
export function getCheckinPendingRequests(): Promise<CheckinRequest[]> {
  const hostId = withHostId("{hostid}");
  return Promise.all([
    get<CheckinRequest[]>(`${API_PATHS.SESSIONS}/pending/${hostId}`),
    get<CheckinRequest[]>(`${API_PATHS.SESSIONS}/field_pending/${hostId}`),
  ]).then(([regular, field]) => [...regular, ...field]);
}

// ---------------------------------------------------------------------------
// Session Storage (encrypted localStorage persistence)
// ---------------------------------------------------------------------------

/** Store session activity data (encrypted with ezdate007) */
export function storeSessionActivityData(
  userId: string,
  keepLoggedIn: boolean,
): void {
  const data: SessionActivityData = {
    userId,
    keepLoggedIn,
    timestamp: Date.now(),
  };
  setEncrypted(
    STORAGE_KEYS.SESSION_ACTIVITY,
    data as unknown as Record<string, unknown>,
    ENCRYPTION_KEYS.DATE,
  );
}

/** Read stored session activity data */
export function getStoredSessionActivityData(): SessionActivityData | null {
  return getEncrypted<SessionActivityData>(
    STORAGE_KEYS.SESSION_ACTIVITY,
    ENCRYPTION_KEYS.DATE,
  );
}

/** Read keepLoggedIn flag from stored activity */
export function getIfToKeepLoggedIn(): boolean {
  const data = getStoredSessionActivityData();
  return data?.keepLoggedIn ?? false;
}

/** Save session info (encrypted with ezinfo007) */
export function saveSessionData(info: StoredSessionInfo): void {
  setEncrypted(
    STORAGE_KEYS.SESSION_INFO,
    info as unknown as Record<string, unknown>,
    ENCRYPTION_KEYS.INFO,
  );
}

/** Read stored session info */
export function getSessionInfoFromStorage(): StoredSessionInfo | null {
  return getEncrypted<StoredSessionInfo>(
    STORAGE_KEYS.SESSION_INFO,
    ENCRYPTION_KEYS.INFO,
  );
}

/** Update stored session info (merge) */
export function updateStoredSessionData(
  updates: Partial<StoredSessionInfo>,
): void {
  const current = getSessionInfoFromStorage();
  if (current) {
    saveSessionData({ ...current, ...updates });
  }
}

/** Clear minimized session data */
export function clearSessionStorageInfoForMinimized(): void {
  removeItem(STORAGE_KEYS.SESSION_INFO);
  removeItem(STORAGE_KEYS.SESSION_ACTION);
}
