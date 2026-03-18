/**
 * Session Students view — ALL course attendees with per-session check-in status.
 * Matches old app element-for-element:
 *   Header: ← All Sessions | Info bar | Search | Resume session...
 *   Table:  Attendee (avatar+name) | Check-in time (✅/❌ + date/"Check-in...") |
 *           Check-in method (text) | Location (icon + text)
 *   Footer: Previous/Next Session links | Rows per Page pagination
 */

import { useEffect, useState, useMemo, startTransition } from "react";
import {
  ArrowLeft,
  Search,
  Play,
  X,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseStore } from "../store/course.store";
import { useSessionStore } from "../store/session.store";
import { useStudentStore } from "../store/student.store";
import {
  COURSE_VIEWS,
  CHECKIN_METHODS,
  type CourseView,
} from "@/config/constants";
import type { Student } from "@/shared/types";
import { CheckinImageDialog } from "@/features/sessions/components/CheckinImageDialog";
import { ManualCheckInDialog } from "./ManualCheckInDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StartSessionDialog } from "@/features/sessions/components/StartSessionDialog";
import { useNavigate, useParams } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Location status helper — mirrors old app geoService.getLocationStatus
// ---------------------------------------------------------------------------
function getLocationStatus(
  location: any,
  course: any,
): "verified" | "remote" | "undetected" {
  if (!location) return "undetected";
  if (!location.latLng) return "undetected";
  if (isNaN(location.distance)) return "undetected";
  if (location.distance < 0) return "undetected";
  // Derive tolerance: course.fieldCheckinRadius || user.fieldCheckinRadius || 200m default
  const tolerance = course?.fieldCheckinRadius ?? 200;
  if (location.distance > tolerance) return "remote";
  return "verified";
}

/** Map location status → display label like old app */
function locationLabel(status: "verified" | "remote" | "undetected") {
  switch (status) {
    case "verified":
      return "Classroom";
    case "remote":
      return "Remote";
    default:
      return "";
  }
}

/** Map method string → translated text like old app's i18n */
function checkinMethodText(method?: string) {
  if (!method) return "";
  switch (method.toUpperCase()) {
    case "QR":
      return "QR scan";
    case "MANUAL":
      return "Manual";
    case "GPS":
      return "GPS";
    case "SELFIE":
      return "Selfie";
    case "CODE":
      return "Code";
    case "LATE_REQUEST":
      return "Late check-in";
    default:
      return method;
  }
}

// ---------------------------------------------------------------------------
// ✅/❌ Circle icon — matches old app XVicon
// ---------------------------------------------------------------------------
function XVIcon({
  checked,
  request,
}: {
  checked: boolean;
  request?: string;
}) {
  // Derive icon type (same logic as old x-v-icon.js)
  let color: string;
  let symbol: React.ReactNode;

  if (request === "pending") {
    color = "#da8806";
    symbol = "?";
  } else if (request === "denied" || (!checked && !request)) {
    color = "#8d181b";
    symbol = <X className="h-2.5 w-2.5" strokeWidth={3} />;
  } else {
    color = "#58B947";
    symbol = "✓";
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {symbol}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionStudents() {
  const navigate = useNavigate();
  const params: any = useParams({ strict: false });
  const urlSessionId = params.sessionId;
  const courseId = useCourseStore((s) => s.courseId);
  const courses = useCourseStore((s) => s.courses);
  const viewCourse = useCourseStore((s) => s.viewCourse);
  const session = useSessionStore((s) => s.session);
  const sessionId = useSessionStore((s) => s.sessionId);
  const sessions = useSessionStore((s) => s.sessions);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const selectSession = useSessionStore((s) => s.selectSession);
  const nextSession = useSessionStore((s) => s.nextSession);
  const prevSession = useSessionStore((s) => s.prevSession);
  const navigateSession = useSessionStore((s) => s.navigateSession);
  const checkUncheck = useSessionStore((s) => s.checkUncheck);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);
  const allStudents = useStudentStore((s) => s.students) as Student[];

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [checkinImage, setCheckinImage] = useState<{
    url: string;
    date: string | number;
  } | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [checkinStudent, setCheckinStudent] = useState<{
    id: string;
    name: string;
    email?: string;
    attendee_manual?: boolean;
    sessionData: any;
  } | null>(null);

  const course = useMemo(
    () => courses?.find((c) => c.id === courseId) ?? null,
    [courses, courseId],
  );

  // Sync route $sessionId to session store (handles browser refresh)
  useEffect(() => {
    if (!courseId || !urlSessionId) return;
    // If the store already has the right session selected, skip
    if (sessionId === urlSessionId && session) return;

    async function syncSession() {
      // If sessions list isn't loaded yet, fetch it first
      const currentSessions = useSessionStore.getState().sessions;
      if (!currentSessions || currentSessions.length === 0) {
        await getCourseSessions(courseId!);
      }
      // Now select the session from the (just-loaded) list
      selectSession(courseId!, urlSessionId);
    }
    syncSession();
  }, [courseId, urlSessionId, sessionId, session, getCourseSessions, selectSession]);

  // Fetch ALL course students
  useEffect(() => {
    async function fetch() {
      if (!courseId) return;
      setLoading(true);
      try {
        await getCourseStudents(courseId);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [courseId, getCourseStudents]);

  // Derive check-in status per student from student.sessions[sessionId]
  const studentsWithStatus = useMemo(() => {
    if (!sessionId || !allStudents) return [];
    return allStudents.map((s) => {
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
      };
    });
  }, [allStudents, sessionId, course]);

  const checkedInCount = useMemo(
    () => studentsWithStatus.filter((s) => s.checkedIn).length,
    [studentsWithStatus],
  );

  const attendanceRate = useMemo(() => {
    const maxAttendance = (course as any)?.maxattendance;
    if (!maxAttendance || !checkedInCount) return 0;
    return Math.round((checkedInCount / maxAttendance) * 100);
  }, [course, checkedInCount]);

  // Search filter
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsWithStatus;
    const term = searchTerm.toLowerCase();
    return studentsWithStatus.filter((s) =>
      s.name?.toLowerCase().includes(term),
    );
  }, [studentsWithStatus, searchTerm]);

  // Pagination
  const totalStudents = filteredStudents.length;
  const pagedStudents = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStudents.slice(start, start + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  // Reset page on search/data change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, studentsWithStatus.length]);

  function handleBack() {
    if (courseId) {
      viewCourse(courseId, COURSE_VIEWS.SESSIONS as CourseView);
    }
  }

  function handleStudentClick(studentId: string) {
    if (courseId) {
      useCourseStore.getState().setStudentId(studentId);
      viewCourse(courseId, COURSE_VIEWS.STUDENT_SESSIONS as CourseView);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Skeleton width={24} height={24} borderRadius="50%" />
          <div className="flex-1">
            <Skeleton width={180} height={14} borderRadius={3} />
            <Skeleton
              width={120}
              height={10}
              borderRadius={3}
              className="mt-1"
            />
          </div>
        </div>
        <div className="px-2 py-2 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2"
              style={{ height: 40 }}
            >
              <Skeleton width={40} height={40} borderRadius={4} />
              <Skeleton
                width={`${20 + (i % 3) * 7}%`}
                height={12}
                borderRadius={3}
              />
              <Skeleton
                width={`${15 + (i % 2) * 10}%`}
                height={12}
                borderRadius={3}
              />
              <Skeleton width={52} height={12} borderRadius={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Session info helpers ──────────────────────────────────
  const sessionStartDate = session?.begins
    ? new Date(session.begins).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  const durationStr = (session as any)?.duration
    ? `${String(Math.floor((session as any).duration / 60)).padStart(2, "0")}:${String((session as any).duration % 60).padStart(2, "0")}`
    : "";

  const locationText = (session as any)?.location?.locationText as
    | string
    | undefined;

  // Pagination range text
  const startRow = totalStudents > 0 ? page * rowsPerPage + 1 : 0;
  const endRow = Math.min((page + 1) * rowsPerPage, totalStudents);
  const maxPage = Math.max(0, Math.ceil(totalStudents / rowsPerPage) - 1);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ═══ A1 — Back link ═══════════════════════════════════ */}
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Sessions</span>
        </button>
      </div>

      {/* ═══ A2 — Session info bar ════════════════════════════ */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-[13px] text-gray-700">
          <span className="font-medium">
            {session?.name ||
              `Session ${(session as any)?.serialId ?? ""}`}
          </span>
          <span className="mx-2 text-gray-400 text-lg align-middle">|</span>
          <span>
            {checkedInCount} of {studentsWithStatus.length} attendees,
            attendance rate: {attendanceRate}%
          </span>
          {sessionStartDate && (
            <>
              <span className="mx-2 text-gray-400 text-lg align-middle">
                |
              </span>
              <span>
                {sessionStartDate}
                {durationStr ? `, ${durationStr} minutes` : ""}
              </span>
            </>
          )}
          {locationText && (
            <>
              <span className="mx-2 text-gray-400 text-lg align-middle">
                |
              </span>
              <span>Location: </span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(locationText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {locationText}
              </a>
            </>
          )}
        </div>
      </div>

      {/* ═══ A3 Search + A4 Resume session ════════════════════ */}
      <div className="flex items-center justify-between px-4 py-1.5">
        {/* A3 — Search (right side in old app, but here we keep flex order) */}
        <div className="flex-1" />
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) =>
              startTransition(() => setSearchTerm(e.target.value))
            }
            className={cn(
              "w-[200px] border-b border-gray-300 bg-white py-1 pr-7 text-sm text-gray-800",
              "placeholder:text-gray-400 focus:border-accent focus:outline-none transition-colors",
            )}
          />
          {searchTerm.length > 0 ? (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* ═══ Resume session — right-aligned, above table ══════ */}
      <div className="flex justify-end px-4 pb-1">
        <button
          onClick={() => setResumeDialogOpen(true)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Play className="h-3 w-3 fill-current" />
          <span className="underline">Resume session...</span>
        </button>
      </div>

      {/* ═══ TABLE ════════════════════════════════════════════ */}
      {pagedStudents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center flex-1">
          <Users className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            {studentsWithStatus.length === 0
              ? "No attendees enrolled"
              : "No matching students"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '2%' }} />
            </colgroup>
            {/* ── B1-B4 Headers (normal case, matching old app) ── */}
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
                <th className="px-4 py-2 text-left font-normal text-gray-600">
                  Attendee
                </th>
                <th className="px-4 py-2 text-left font-normal text-gray-600">
                  Check-in time
                </th>
                <th className="px-4 py-2 text-left font-normal text-gray-600">
                  Check-in method
                </th>
                <th className="px-4 py-2 text-left font-normal text-gray-600">
                  Location
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pagedStudents.map((student) => {
                const isCheckedIn = student.checkedIn;
                const methodText = checkinMethodText(student.checkinMethod);
                const locStatus = student.locationStatus;
                const locText = locationLabel(locStatus);
                const locColor =
                  locStatus === "verified"
                    ? "text-green-600"
                    : locStatus === "remote"
                      ? "text-red-500"
                      : "text-gray-400";

                return (
                  <tr
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      height: 48,
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    {/* ── C1/D1 — Avatar + Name ── */}
                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        <img
                          width={40}
                          height={40}
                          className="shrink-0 object-cover"
                          style={{ borderRadius: 2 }}
                          src={
                            student.picture ||
                            "/assets/images/icons/profile.jpg"
                          }
                          alt="avatar"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (!img.src.endsWith('/assets/images/icons/profile.jpg')) {
                              img.src = '/assets/images/icons/profile.jpg';
                            }
                          }}
                        />
                        <span className="text-gray-800">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* ── C3/D3 — Check-in time ── */}
                    <td className="px-4">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCheckinStudent({
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            attendee_manual: student.attendee_manual,
                            sessionData: student.sessions?.[sessionId!] ?? null,
                          });
                        }}
                      >
                        {/* ✅ or ❌ icon */}
                        <XVIcon
                          checked={isCheckedIn}
                          request={student.request}
                        />
                        {isCheckedIn ? (
                          <span className="text-gray-700">
                            {student.checkinTime
                              ? new Date(
                                  student.checkinTime,
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "—"}
                          </span>
                        ) : (
                          <span className="text-blue-600 underline hover:text-blue-800 text-sm">
                            Check-in...
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ── C4 — Check-in method (TEXT, not icon) ── */}
                    <td className="px-4">
                      {isCheckedIn && methodText ? (
                        <span className="underline text-gray-700 cursor-pointer">
                          {methodText}
                        </span>
                      ) : null}
                    </td>

                    {/* ── C5 — Location (icon + text label) ── */}
                    <td className="px-4">
                      {isCheckedIn && locStatus !== "undetected" ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            locColor,
                          )}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>{locText}</span>
                        </span>
                      ) : null}
                    </td>

                    <td />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ E — FOOTER ══════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-gray-200 text-sm shrink-0"
        style={{ minHeight: 48 }}
      >
        {/* E1/E2 — Previous / Next Session links */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateSession("prev")}
            disabled={!prevSession}
            className={cn(
              "text-blue-600 hover:underline",
              !prevSession && "text-gray-400 cursor-not-allowed no-underline",
            )}
          >
            Previous Session
          </button>
          <button
            onClick={() => navigateSession("next")}
            disabled={!nextSession}
            className={cn(
              "text-blue-600 hover:underline",
              !nextSession && "text-gray-400 cursor-not-allowed no-underline",
            )}
          >
            Next Session
          </button>
        </div>

        {/* E3 — Rows per Page + pagination */}
        <div className="flex items-center gap-3 text-gray-600">
          <span>Rows per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border border-gray-300 rounded px-1 py-0.5 text-sm bg-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-gray-500">
            {startRow}-{endRow} of {totalStudents}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={cn(
              "p-0.5 rounded hover:bg-gray-100",
              page === 0 && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className={cn(
              "p-0.5 rounded hover:bg-gray-100",
              page >= maxPage && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ Dialogs ═════════════════════════════════════════ */}
      <CheckinImageDialog
        open={!!checkinImage}
        onOpenChange={(open) => {
          if (!open) setCheckinImage(null);
        }}
        imageUrl={checkinImage?.url ?? ""}
        date={checkinImage?.date ?? ""}
      />

      <StartSessionDialog
        open={resumeDialogOpen}
        onOpenChange={(open) => !open && setResumeDialogOpen(false)}
        resumedSession={session}
        onSessionStarted={(session) => {
          setResumeDialogOpen(false);
          try {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } catch {
            /* fullscreen not available */
          }
          navigate({
            to: "/session/$shortid",
            params: {
              shortid:
                (session as any).shortId ||
                (session as any).shortid ||
                session.id,
            },
          });
        }}
      />

      <ManualCheckInDialog
        open={!!checkinStudent}
        onOpenChange={(open) => { if (!open) setCheckinStudent(null); }}
        studentName={checkinStudent?.name ?? ""}
        sessionName={session?.name || `Session ${(session as any)?.serialId ?? ""}`}
        studentSession={checkinStudent?.sessionData}
        onToggleCheckIn={async (action) => {
          if (!courseId || !sessionId || !checkinStudent) return;

          if (action === "approve" || action === "deny") {
            // Late check-in request: update the request status
            const updatedStudent = allStudents.find(s => s.id === checkinStudent.id);
            if (updatedStudent?.sessions?.[sessionId]) {
              updatedStudent.sessions[sessionId].request = action === "approve" ? "approved" : "denied";
            }
          }

          const isCheckin = action === "check" || action === "approve";

          await checkUncheck({
            courseId,
            sessionId,
            checkin: isCheckin,
            attendeeid: checkinStudent.id,
            method: CHECKIN_METHODS.MANUAL as any,
            code: "MANUAL",
            icon: 0,
            name: checkinStudent.name,
            email: checkinStudent.email,
            attendee_manual: checkinStudent.attendee_manual,
          });
          // Re-fetch to update the view
          await getCourseStudents(courseId);
          setCheckinStudent(null);
        }}
      />
    </div>
  );
}
