/**
 * Admin analytics service.
 * API methods for admin statistics and super admin views.
 * Maps to legacy EZDataService admin methods (services-layer.md §1.1).
 */

import { API_PATHS } from "@/config/constants";
import { get, post } from "./api-client";
import { getEffectiveHostId } from "./storage";
import type {
  AdminGeneralStats,
  AdminCourseStats,
  AdminHostStats,
  AdminGraphDataPoint,
  AttendeeInfo,
  HostActivity,
  AttendeesByDomain,
} from "@/shared/types";

// ---------------------------------------------------------------------------
// Admin Statistics (4 parallel requests for general stats)
// ---------------------------------------------------------------------------

/** Fetch general admin statistics (4 parallel sub-requests) */
export async function getAdminGeneralStatistics(
  data: Record<string, unknown>,
): Promise<AdminGeneralStats> {
  // Legacy: 4 parallel POST requests to ggs_g, ggs_gg, ggs_f, ggs_fg
  const hostId = getEffectiveHostId();
  const payload = { ...data, hostId };

  const [generalRes, generalGraphRes, fieldRes, fieldGraphRes] =
    await Promise.all([
      post(`${API_PATHS.ADMIN}/ggs_g`, payload),
      post(`${API_PATHS.ADMIN}/ggs_gg`, payload),
      post(`${API_PATHS.ADMIN}/ggs_f`, payload),
      post(`${API_PATHS.ADMIN}/ggs_fg`, payload),
    ]);

  return {
    general: (generalRes as any)?.overallData || generalRes,
    generalGraph: (generalGraphRes as any)?.overallGraphData || generalGraphRes,
    field: (fieldRes as any)?.facultiesData || fieldRes,
    fieldGraph: (fieldGraphRes as any)?.facultiesGraphData || fieldGraphRes,
  } as unknown as AdminGeneralStats;
}

/** Fetch course-level statistics */
export async function getAdminCoursesGeneralStatistics(
  data: Record<string, unknown>,
): Promise<AdminCourseStats[]> {
  const hostId = getEffectiveHostId();
  const res = await post<any>(`${API_PATHS.ADMIN}/ggc_g`, {
    ...data,
    hostId,
  });
  return res?.coursesData || res || [];
}

/** Fetch host-level statistics */
export async function getAdminHostsGeneralStatistics(
  data: Record<string, unknown>,
): Promise<AdminHostStats[]> {
  const hostId = getEffectiveHostId();
  const res = await post<any>(`${API_PATHS.ADMIN}/ggh_g`, {
    ...data,
    hostId,
  });
  return res?.hostsData || res || [];
}

/** Fetch course graph time series data */
export async function getAdminCoursesGraphStatistics(
  data: Record<string, unknown>,
): Promise<AdminGraphDataPoint[]> {
  const hostId = getEffectiveHostId();
  const res = await post<Record<string, unknown>>(`${API_PATHS.ADMIN}/ggc_gg`, {
    ...data,
    hostId,
  });
  return (res?.coursesGraphData ||
    res?.graphData ||
    res ||
    []) as AdminGraphDataPoint[];
}

/** Fetch host graph time series data */
export async function getAdminHostsGraphStatistics(
  data: Record<string, unknown>,
): Promise<AdminGraphDataPoint[]> {
  const hostId = getEffectiveHostId();
  const res = await post<Record<string, unknown>>(`${API_PATHS.ADMIN}/ggh_gg`, {
    ...data,
    hostId,
  });
  return (res?.hostsGraphData ||
    res?.graphData ||
    res ||
    []) as AdminGraphDataPoint[];
}

/** Fetch institute attendees statistics by fetching group members */
export async function getInstituteAttendeesStatistics(
  data: Record<string, unknown>,
): Promise<unknown> {
  const groupId = data.groupId as string;
  if (!groupId) return { classroomData: [] };

  try {
    const res = await get<any>(`${API_PATHS.GROUPS}/${groupId}`);
    return { classroomData: res?.members || [] };
  } catch (err) {
    console.error("Error fetching attendees:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Admin Lookup Methods
// ---------------------------------------------------------------------------

/** Get unique attendees for admin view */
export function getAdminUniqueAttendees(
  params: Record<string, string>,
): Promise<unknown[]> {
  return get(`${API_PATHS.ADMIN}/admin_unique_attendees`, params);
}

/** Get unique attendees for a specific host */
export function getHostUniqueAttendees(
  params: Record<string, string>,
): Promise<unknown[]> {
  return get(`${API_PATHS.ADMIN}/host_unique_attendees`, params);
}

/** Get hosts by activity (super admin) */
export function getHostsByActivity(
  from: string,
  to: string,
): Promise<HostActivity[]> {
  return get<HostActivity[]>(`${API_PATHS.ADMIN}/host_by_activity`, {
    from,
    to,
  });
}

/** Get attendees grouped by domain (super admin) */
export function getAttendeesByDomain(
  from: string,
  to: string,
): Promise<AttendeesByDomain[]> {
  return get<AttendeesByDomain[]>(`${API_PATHS.ADMIN}/attendees_by_domain`, {
    from,
    to,
  });
}

/** Bulk fetch attendee info */
export function getAttendeesInfo(attendees: string[]): Promise<AttendeeInfo[]> {
  return post<AttendeeInfo[]>(`${API_PATHS.ADMIN}/gai`, { attendees });
}

/** Get student courses for a specific student (admin context) */
export function getStudentCourses(studentId: string): Promise<unknown[]> {
  const hostId = getEffectiveHostId();
  return get(`${API_PATHS.HOST}/${hostId}/courses/${studentId}`);
}
