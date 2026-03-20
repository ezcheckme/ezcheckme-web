/**
 * Course domain service.
 * API methods for course CRUD, templates, and field check-ins.
 * Maps to legacy EZDataService courses methods (services-layer.md §1.1).
 */

import { API_PATHS } from "@/config/constants";
import { get, post, put, del, withHostId } from "./api-client";
import { getEffectiveHostId } from "./storage";
import pako from "pako";
import type { Course, CourseTemplate, FieldCheckin } from "@/shared/types";

// ---------------------------------------------------------------------------
// Course CRUD
// ---------------------------------------------------------------------------

/** Fetch all courses for the current host */
export function getAllCourses(): Promise<Course[]> {
  return get<Course[]>(`${API_PATHS.COURSES}/${withHostId("{hostid}")}`);
}

/** Create a new course */
export function addCourse(props: Partial<Course>): Promise<Course> {
  const hostId = getEffectiveHostId();
  if (!hostId) throw new Error("No host ID available — cannot create course");
  const data = {
    ...props,
    hostid: hostId,
    begins: props.begins ?? Date.now(),
  };
  return post<Course>(API_PATHS.COURSES, data);
}

/** Update course properties */
export function updateCourse(
  props: Partial<Course> & { id: string },
): Promise<Course> {
  return put<Course>(`${API_PATHS.COURSES}/${props.id}`, props);
}

/** Delete a course */
export function deleteCourse(courseId: string): Promise<void> {
  const hostId = withHostId("{hostid}");
  return del<void>(`${API_PATHS.COURSES}/${courseId}/${hostId}`);
}

// ---------------------------------------------------------------------------
// Course Data
// ---------------------------------------------------------------------------

/** List enrolled students for a course */
export function getCourseStudents(courseId: string): Promise<unknown[]> {
  return get(`${API_PATHS.COURSES}/${courseId}/students`);
}

/**
 * Get field check-ins for a course.
 * The Lambda returns { checkins: [...] } for small payloads,
 * or { checkins: "base64_gzip_string", compressed: true } for large (>5MB).
 */
export async function getCourseFieldCheckins(
  courseId: string,
): Promise<FieldCheckin[]> {
  const response = await get<{
    checkins: FieldCheckin[] | string;
    compressed?: boolean;
  }>(`${API_PATHS.COURSES}/field_checkins/${courseId}`);

  if (!response || !response.checkins) return [];

  if (response.compressed && typeof response.checkins === "string") {
    // base64 → Uint8Array → pako inflate → JSON parse
    const binary = Uint8Array.from(atob(response.checkins), (c) =>
      c.charCodeAt(0),
    );
    const json = pako.inflate(binary, { to: "string" });
    return JSON.parse(json) as FieldCheckin[];
  }

  return response.checkins as FieldCheckin[];
}

/** Check if course is locked for dynamic attendee adding */
export function getIsCourseLockedForDynamicAddingAttendees(
  courseId: string,
  userId: string,
): Promise<{ locked: boolean }> {
  return get(`${API_PATHS.COURSES}/${courseId}/attendee/${userId}`);
}

/** Get latest course for a host (the course with the most recent session) */
export function getLatestCourse(): Promise<{ result?: { courseid: string } }> {
  const hostId = getEffectiveHostId();
  if (!hostId) return Promise.resolve({});
  return get(`${API_PATHS.HOST}/latest_course`, { id: hostId });
}

// ---------------------------------------------------------------------------
// Check-in Requests
// ---------------------------------------------------------------------------

/** Get pending check-in requests for the current host */
export function getCheckinPendingRequests(): Promise<unknown> {
  const hostId = withHostId("{hostid}");
  return Promise.all([
    get<{ requests: unknown[] }>(`${API_PATHS.SESSIONS}/pending/${hostId}`),
    get<{ requests: unknown[] }>(
      `${API_PATHS.SESSIONS}/field_pending/${hostId}`,
    ),
  ]).then(([regular, field]) => {
    return {
      requests: [...(regular?.requests || []), ...(field?.requests || [])],
    };
  });
}

/** Approve/Deny a regular late check-in request */
export function handleLateRequestCheckin(
  sessionId: string,
  data: { approval: "approved" | "denied"; attendeeid: string },
): Promise<unknown> {
  return put(`${API_PATHS.SESSIONS}/handle_late_request/${sessionId}`, data);
}

/** Approve/Deny a field late check-in request */
export function handleFieldLateRequestCheckin(data: {
  approval: "approved" | "denied";
  [key: string]: any;
}): Promise<unknown> {
  // Legacy path was `/field_checkin/field_cru/`
  // Assuming our API_PATHS maps the base correctly. Let's use direct path to be safe.
  return post(`/field_checkin/field_cru/`, data);
}

// ---------------------------------------------------------------------------
// Course Templates
// ---------------------------------------------------------------------------

/** Get course templates for a group */
export function getCourseTemplates(groupId: string): Promise<CourseTemplate[]> {
  return get<CourseTemplate[]>(
    `${API_PATHS.COURSES}/get_course_templates/${groupId}`,
  );
}

/** Create a new course template */
export function createCourseTemplate(
  data: Partial<CourseTemplate>,
): Promise<CourseTemplate> {
  return post<CourseTemplate>(
    `${API_PATHS.COURSES}/create_course_template`,
    data,
  );
}

/** Update a course template */
export function updateCourseTemplate(
  data: Partial<CourseTemplate> & { id: string },
): Promise<CourseTemplate> {
  return post<CourseTemplate>(
    `${API_PATHS.COURSES}/update_course_template`,
    data,
  );
}

/** Delete a course template */
export function deleteCourseTemplate(templateId: string): Promise<void> {
  return del<void>(`${API_PATHS.COURSES}/delete_course_template/${templateId}`);
}
