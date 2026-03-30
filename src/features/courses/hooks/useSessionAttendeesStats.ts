import { useMemo } from "react";
import type { Student } from "@/shared/types";
import { getLocationStatus, type LocationStatus } from "../utils/attendance.utils";

export interface StudentSessionStatus extends Student {
  checkedIn: boolean;
  checkinTime?: string | number;
  checkinMethod?: string;
  checkinLocation?: any;
  locationStatus: LocationStatus;
  request?: string;
  checkinSelfie?: string;
  checkinReason?: string;
}

export function useSessionAttendeesStats(
  students: Student[],
  sessionId: string | null,
  course: any
) {
  const studentsWithStatus = useMemo<StudentSessionStatus[]>(() => {
    if (!sessionId || !students) return [];
    return students.map((s) => {
      const sessionData = s.sessions?.[sessionId];
      const loc = sessionData?.location;
      const locStatus = getLocationStatus(loc, course);
      return {
        ...s,
        checkedIn: !!(sessionData?.time),
        checkinTime: sessionData?.time,
        checkinMethod: sessionData?.method,
        checkinLocation: loc,
        locationStatus: locStatus,
        request: sessionData?.request,
        checkinSelfie: sessionData?.selfie,
        checkinReason: sessionData?.reason,
      };
    });
  }, [students, sessionId, course]);

  const checkedInCount = useMemo(
    () => studentsWithStatus.filter((s) => s.checkedIn).length,
    [studentsWithStatus],
  );

  const attendanceRate = useMemo(() => {
    const maxAttendance = course?.maxattendance;
    if (!maxAttendance || !checkedInCount) return 0;
    return Math.round((checkedInCount / maxAttendance) * 100);
  }, [course, checkedInCount]);

  return {
    studentsWithStatus,
    checkedInCount,
    attendanceRate,
  };
}
