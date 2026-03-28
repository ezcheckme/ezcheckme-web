/**
 * Course Dashboard tab — matches legacy CourseDashboard.js layout.
 *
 * TOP ROW:  Attendance Rate card (Course / Latest Session)  |  Sessions Attendance Rate line chart
 * BOTTOM ROW:  Attendees Attendance table  |  Attendees With Missed Past Sessions  |  Latest Sessions Absentees
 */

import { useMemo, useEffect } from "react";
import { HelpCircle, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionStore } from "../store/session.store";
import { useStudentStore } from "../store/student.store";
import { useCourseStore } from "../store/course.store";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function CourseDashboard() {
  const courseId = useCourseStore((s) => s.courseId);
  const courses = useCourseStore((s) => s.courses);
  const sessions = useSessionStore((s) => s.sessions);
  const students = useStudentStore((s) => s.students);
  const studentsLoading = useStudentStore((s) => s.loading);
  const sessionsLoading = useSessionStore((s) => s.loading);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);
  const getCourses = useCourseStore((s) => s.getCourses);
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "Premium";

  // Load courses, students, and sessions when Dashboard mounts
  // (they may not be loaded yet on direct URL navigation)
  useEffect(() => {
    if (!courses) {
      getCourses();
    }
  }, [courses, getCourses]);

  useEffect(() => {
    if (courseId) {
      getCourseStudents(courseId);
      getCourseSessions(courseId);
    }
  }, [courseId, getCourseStudents, getCourseSessions]);

  const course = useMemo(
    () => courses?.find((c) => c.id === courseId),
    [courses, courseId],
  );

  const analytics = useMemo(() => {
    const totalCourseAttendees =
      course?.maxattendance || course?.studentsCount || students.length || 1;
    const totalSessions = sessions.length;

    // ---- Course Attendance Rate ----
    // Legacy: sum *approved* attendees across all sessions / (sessions.length * totalCourseAttendees)
    // We compute from students' session map: for each session, count students who checked in
    let courseCheckins = 0;
    const sessionsAttendance: { attendance: number; session: typeof sessions[0] }[] = [];

    // Sort sessions oldest-first for the chart
    const chronologicalSessions = [...sessions].reverse();

    chronologicalSessions.forEach((session) => {
      let sessionAttendees = 0;
      students.forEach((student) => {
        const studentSessions = student.sessions;
        if (studentSessions && studentSessions[session.id]) {
          const req = studentSessions[session.id]?.request;
          // Legacy excludes "pending" and "denied"
          if (!req || (req !== "pending" && req !== "denied")) {
            sessionAttendees += 1;
          }
        }
      });
      courseCheckins += sessionAttendees;
      sessionsAttendance.push({
        attendance:
          totalCourseAttendees > 0
            ? Math.round((1000 * sessionAttendees) / totalCourseAttendees) / 10
            : 0,
        session,
      });
    });

    const courseAttendanceRate =
      totalSessions > 0 && totalCourseAttendees > 0
        ? Math.round(
            (courseCheckins / totalSessions / totalCourseAttendees) * 1000,
          ) / 10
        : 0;

    // ---- Latest Session Attendance Rate ----
    // Legacy: latestSession (by `updatedat`) attendees / totalCourseAttendees
    const latestSession = sessions[0]; // sessions already sorted newest-first
    let lastSessionAttendanceRate = 0;
    if (latestSession) {
      let latestAttendees = 0;
      students.forEach((student) => {
        const studentSessions = student.sessions;
        if (studentSessions && studentSessions[latestSession.id]) {
          latestAttendees += 1;
        }
      });
      lastSessionAttendanceRate =
        totalCourseAttendees > 0
          ? Math.round((latestAttendees / totalCourseAttendees) * 1000) / 10
          : 0;
    }

    // ---- Per-student attendance rate + missed sessions ----
    const studentsData = students.map((student) => {
      let attendance = 0;
      let missed = 0;
      const studentSessions = student.sessions || {};
      sessions.forEach((session) => {
        if (studentSessions[session.id]) {
          const req = studentSessions[session.id]?.request;
          if (!req || (req !== "pending" && req !== "denied")) {
            attendance += 1;
          }
        }
        // Count missed past sessions
        if (
          !studentSessions[session.id] &&
          session.begins < Date.now()
        ) {
          missed += 1;
        }
      });
      const attendanceRate =
        totalSessions > 0
          ? Math.round((1000 * attendance) / totalSessions) / 10
          : 0;
      return {
        id: student.id,
        name:
          student.name ||
          `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
          "Unknown",
        attendanceRate,
        missed,
      };
    });

    // ---- Latest Session Absentees ----
    const lastSessionAbsentees = latestSession
      ? studentsData.filter((s) => {
          const studentSessions = students.find((st) => st.id === s.id)?.sessions || {};
          return !studentSessions[latestSession.id];
        })
      : [];

    return {
      courseAttendanceRate,
      lastSessionAttendanceRate,
      sessionsAttendance,
      studentsData,
      lastSessionAbsentees,
    };
  }, [sessions, students, course]);

  if (studentsLoading || sessionsLoading) {
    return (
      <div style={{ padding: "24px 32px" }}>
        {/* Top row skeleton */}
        <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          {/* Attendance Rate Card */}
          <div style={{ width: "calc(33.33% - 16px)", minWidth: 260, background: "#fff", borderRadius: 4, boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.2)", padding: 16 }}>
            <Skeleton width={140} height={16} borderRadius={3} />
            <div style={{ borderBottom: "1px solid #e0e0e0", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <Skeleton width={60} height={40} borderRadius={4} />
                <Skeleton width={48} height={12} borderRadius={3} className="mt-2 mx-auto" />
              </div>
              <div style={{ textAlign: "center" }}>
                <Skeleton width={60} height={40} borderRadius={4} />
                <Skeleton width={80} height={12} borderRadius={3} className="mt-2 mx-auto" />
              </div>
            </div>
          </div>
          {/* Chart Card */}
          <div style={{ width: "calc(66.66% - 16px)", minWidth: 260, background: "#fff", borderRadius: 4, boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.2)", padding: 16 }}>
            <Skeleton width={200} height={16} borderRadius={3} />
            <Skeleton height={140} borderRadius={4} className="mt-3" />
          </div>
        </div>
        {/* Bottom row skeleton */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ width: "calc(33.33% - 16px)", minWidth: 260, background: "#fff", borderRadius: 4, boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.2)", padding: 16 }}>
              <Skeleton width={160} height={14} borderRadius={3} />
              <div className="space-y-2 mt-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton width={`${50 + (j % 3) * 10}%`} height={12} borderRadius={3} />
                    <Skeleton width={40} height={12} borderRadius={3} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* TOP ROW: Attendance Rate card + Sessions Attendance Rate chart */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
        {/* Attendance Rate Card */}
        <DashboardCard
          title="Attendance Rate"
          icon={<DonutIcon />}
          width="calc(33.33% - 16px)"
        >
          <div style={{ display: "flex", justifyContent: "space-around", position: "relative" }}>
            {/* Vertical divider matching old app */}
            <div style={{ width: 1, height: "80%", background: "#20486a", position: "absolute", top: "10%", left: "50%" }} />
            <div className="flex flex-col w-1/2 items-center">
              <span style={{ fontSize: 50, fontWeight: 700, color: "#20486a" }}>
                {analytics.courseAttendanceRate
                  ? analytics.courseAttendanceRate
                  : "-"}
                {analytics.courseAttendanceRate ? (
                  <span style={{ fontSize: 40 }}>%</span>
                ) : (
                  ""
                )}
              </span>
              <span style={{ fontSize: 20, textAlign: "center", color: "#20486a" }}>
                Course
              </span>
            </div>
            <div className="flex flex-col w-1/2 items-center">
              <span style={{ fontSize: 50, fontWeight: 700, color: "#20486a" }}>
                {analytics.lastSessionAttendanceRate
                  ? analytics.lastSessionAttendanceRate
                  : "-"}
                {analytics.lastSessionAttendanceRate ? (
                  <span style={{ fontSize: 40 }}>%</span>
                ) : (
                  ""
                )}
              </span>
              <span style={{ fontSize: 20, textAlign: "center", color: "#20486a" }}>
                Latest Session
              </span>
            </div>
          </div>
        </DashboardCard>

        {/* Sessions Attendance Rate Chart */}
        <DashboardCard
          title="Sessions Attendance Rate"
          icon={<TimelineIcon />}
          width="calc(66.66% - 16px)"
          blurred={!isPremium}
        >
          <div style={{ height: 160, padding: "8px 16px" }}>
            {analytics.sessionsAttendance.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                No session data
              </div>
            ) : (
              <SimpleLineChart data={analytics.sessionsAttendance} />
            )}
          </div>
        </DashboardCard>
      </div>

      {/* BOTTOM ROW: Three analytical tables */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Attendees Attendance */}
        <DashboardCard
          title="Attendees Attendance"
          width="calc(33.33% - 16px)"
          icon={<AttendeeIcon />}
          blurred={!isPremium}
        >
          <SimpleTable
            headers={["Name", "Attendance"]}
            rows={[...analytics.studentsData]
              .sort((a, b) => a.attendanceRate - b.attendanceRate)
              .map((s) => [s.name, `${s.attendanceRate}%`])}
          />
        </DashboardCard>

        {/* Attendees With Missed Past Sessions */}
        <DashboardCard
          title="Attendees With Missed Past Sessions"
          width="calc(33.33% - 16px)"
          icon={<AttendeeIcon />}
          blurred={!isPremium}
        >
          <SimpleTable
            headers={["Name", "Missed"]}
            rows={[...analytics.studentsData]
              .filter((s) => s.missed > 0)
              .sort((a, b) => b.missed - a.missed)
              .map((s) => ({
                cells: [s.name, String(s.missed)],
                color:
                  s.missed > 3
                    ? "#b1261f"
                    : s.missed > 1
                      ? "#de7436"
                      : "#000",
              }))}
            coloredRows
          />
        </DashboardCard>

        {/* Latest Sessions Absentees */}
        <DashboardCard
          title="Latest Sessions Absentees"
          width="calc(33.33% - 16px)"
          blurred={!isPremium}
        >
          <SimpleTable
            headers={["Name"]}
            rows={analytics.lastSessionAbsentees.map((s) => [s.name])}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Dashboard Card — matches legacy DashboardCard with Material shadow */
function DashboardCard({
  title,
  icon,
  width,
  children,
  blurred = false,
}: {
  title: string;
  icon?: React.ReactNode;
  width: string;
  children: React.ReactNode;
  blurred?: boolean;
}) {
  return (
    <div
      style={{
        width,
        minWidth: 260,
        height: 300,
        background: "#f5f5f5",
        borderRadius: 10,
        boxShadow: "1px 1px 5px grey, -1px -0.5px 3px grey",
        overflow: "hidden",
        flex: "1 1 auto",
        position: "relative",
        color: "#20486a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 8,
          background: "#f5f5f5",
          color: blurred ? "#00000038" : "#20486a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontSize: 20, fontWeight: 700 }}>
            {title}
          </span>
        </div>
        <HelpCircle
          style={{ width: 18, height: 18, color: "#20486a", cursor: "pointer", marginTop: 12, marginRight: 19 }}
        />
      </div>
      <div style={{
        background: "#fff",
        border: "1px solid #ddd",
        margin: "5px 20px 20px 20px",
        padding: 0,
        height: "78%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        filter: blurred ? "blur(5px)" : undefined,
        userSelect: blurred ? "none" : undefined,
        overflow: "auto",
        width: "auto",
      }}>{children}</div>
      {blurred && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.6)",
            zIndex: 2,
          }}
        >
          <Lock style={{ width: 28, height: 28, color: "#888", marginBottom: 8 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>
            Premium Feature
          </span>
          <span style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            Upgrade to view this data
          </span>
        </div>
      )}
    </div>
  );
}

/** Simple Table for dashboard cards */
function SimpleTable({
  headers,
  rows,
  coloredRows,
}: {
  headers: string[];
  rows: (string[] | { cells: string[]; color: string })[];
  coloredRows?: boolean;
}) {
  return (
    <div style={{ maxHeight: 200, overflow: "auto", padding: "0 4px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "6px 16px",
                  fontWeight: 500,
                  color: "#666",
                  borderBottom: "1px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#fff",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const isColoredRow = coloredRows && !Array.isArray(row);
              const cells = Array.isArray(row) ? row : row.cells;
              const color = isColoredRow ? (row as { color: string }).color : undefined;
              return (
                <tr
                  key={i}
                  style={{
                    color: color || "#333",
                    cursor: "pointer",
                  }}
                >
                  {cells.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "6px 16px",
                        borderBottom: "1px solid #f0f0f0",
                        color: color || undefined,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Simple SVG line chart — renders attendance % over sessions (no library needed) */
function SimpleLineChart({
  data,
}: {
  data: { attendance: number; session: { name: string; begins: number } }[];
}) {
  if (data.length === 0) return null;

  const width = 600;
  const height = 140;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const maxVal = 100;
  const points = data.map((d, i) => ({
    x: padX + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padY + chartH - (d.attendance / maxVal) * chartH,
    label: new Date(d.session.begins).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    value: d.attendance,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Y-axis ticks
  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis labels */}
      {yTicks.map((v) => {
        const y = padY + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line
              x1={padX}
              x2={padX + chartW}
              y1={y}
              y2={y}
              stroke="#eee"
              strokeWidth={0.5}
            />
            <text
              x={padX - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={8}
              fill="#999"
            >
              {v}
            </text>
          </g>
        );
      })}
      {/* Line */}
      <path d={pathD} fill="none" stroke="#379ce8" strokeWidth={2} />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#379ce8">
          <title>
            {p.label}: {p.value}%
          </title>
        </circle>
      ))}
      {/* X-axis labels (show max ~8) */}
      {points
        .filter(
          (_, i) =>
            data.length <= 8 ||
            i % Math.ceil(data.length / 8) === 0 ||
            i === data.length - 1,
        )
        .map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 2}
            textAnchor="middle"
            fontSize={7}
            fill="#999"
          >
            {p.label}
          </text>
        ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG matching legacy Material icons)
// ---------------------------------------------------------------------------

function DonutIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#666"
      style={{ marginLeft: 8 }}
    >
      <path d="M11 5.08V2c-5 .5-9 4.81-9 10s4 9.5 9 10v-3.08c-3-.48-6-3.4-6-6.92s3-6.44 6-6.92zM18.97 11H22c-.47-5-4-8.53-9-9v3.08C16 5.51 18.54 8 18.97 11zM13 18.92V22c5-.47 8.53-4 9-9h-3.03c-.43 3-2.97 5.49-5.97 5.92z" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#666"
      style={{ marginLeft: 8 }}
    >
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
    </svg>
  );
}

function AttendeeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
