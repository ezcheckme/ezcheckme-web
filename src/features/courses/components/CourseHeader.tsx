import { useState } from "react";
import { PrintableSignDialog } from "./PrintableSignDialog";
import { theme } from "@/config/theme";
import {
  Play,
  ArrowLeft,
  LayoutDashboard,
  AlignJustify,
  Users,
  MessageSquare,
  FileSpreadsheet,
  Loader2,
  Printer,
  Zap,
} from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useCourseStore } from "../store/course.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { COURSE_VIEWS } from "@/config/constants";

import { StartSessionDialog } from "@/features/sessions/components/StartSessionDialog";
import { DownloadReportGatewayDialog } from "./DownloadReportGatewayDialog";
import { DownloadExcelReportTeaser } from "@/features/billing/components/DownloadExcelReportTeaser";
import { downloadCourseReport } from "@/shared/services/course-report.service";

const allTabs = [
  { id: COURSE_VIEWS.DASHBOARD, label: "Dashboard", Icon: LayoutDashboard },
  { id: COURSE_VIEWS.SESSIONS, label: "Sessions", Icon: AlignJustify },
  { id: COURSE_VIEWS.STUDENTS, label: "Attendees", Icon: Users },
  { id: COURSE_VIEWS.MESSAGES, label: "Messages", Icon: MessageSquare },
] as const;

// Shift courses only show Attendees + Messages (no Dashboard, no Sessions)
const shiftTabs = allTabs.filter(
  (t) => t.id === COURSE_VIEWS.STUDENTS || t.id === COURSE_VIEWS.MESSAGES,
);

export function CourseHeader() {
  const navigate = useNavigate();
  const courses = useCourseStore((s) => s.courses);
  const courseId = useCourseStore((s) => s.courseId);
  const view = useCourseStore((s) => s.view);
  const user = useAuthStore((s) => s.user);

  const [startSessionOpen, setStartSessionOpen] = useState(false);
  const [printableSignOpen, setPrintableSignOpen] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [teaserOpen, setTeaserOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const course = courses?.find((c) => c.id === courseId);
  const isShiftCourse = course?.fieldCheckin === true;
  const tabs = isShiftCourse ? shiftTabs : allTabs;

  // Plan gating: Standard users without excel import see the teaser
  const isStandard =
    user?.plan === "Standard" &&
    !user?.groupmanager &&
    !user?.facultyManager &&
    !user?.superadmin &&
    !user?.excelImportEnabled;

  function handleExportClick() {
    if (isStandard) {
      setTeaserOpen(true);
    } else {
      setGatewayOpen(true);
    }
  }

  async function handleGatewaySelect(type: "upload_and_modify" | "download") {
    if (type === "download" && courseId) {
      setDownloading(true);
      try {
        await downloadCourseReport(courseId);
      } catch (err) {
        console.error("Failed to download report:", err);
        alert("Failed to download report. Please try again.");
      } finally {
        setDownloading(false);
      }
    } else if (type === "upload_and_modify") {
      // TODO: Open UploadExcelForReport dialog (future implementation)
      alert("Upload & Modify coming soon! For now, use 'Download Report'.");
    }
  }

  // Drill-down views show back button
  const isDrillDown =
    view === COURSE_VIEWS.SESSION_STUDENTS ||
    view === COURSE_VIEWS.STUDENT_SESSIONS;

  function handleBack() {
    if (view === COURSE_VIEWS.SESSION_STUDENTS) {
      navigate({ to: `/courses/${courseId}/sessions` as any });
    } else if (view === COURSE_VIEWS.STUDENT_SESSIONS) {
      navigate({ to: `/courses/${courseId}/attendees` as any });
    }
  }

  if (!course) return null;

  return (
    <div className="border-b mx-4" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
      {/* Course name + "Run Session" button */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {isDrillDown && (
            <button
              onClick={handleBack}
              className="rounded p-1 text-gray-500 hover:bg-black/5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-[24px] font-normal text-[var(--color-primary)]">
            {course.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isShiftCourse ? (
            <button
              onClick={() => setPrintableSignOpen(true)}
              className={cn(
                "inline-flex items-center gap-2 rounded px-4 py-2 text-[14px] font-bold",
                "text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer",
              )}
              style={{ background: theme.colors.button.danger }}
            >
              <Printer className="h-4 w-4" />
              Download Printable Course Sign
            </button>
          ) : (
            <>
              {!(
                user?.groupmanager &&
                user?.adminRights?.allow_run_new_session === false
              ) && (
                <button
                  onClick={() => setStartSessionOpen(true)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded px-4 py-2 text-[14px] font-bold uppercase",
                    "text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer",
                  )}
                  style={{ background: theme.colors.button.dangerAlt }}
                >
                  <Play className="h-4 w-4 fill-white" />
                  Run a new check-in session
                </button>
              )}
              {(user as any)?.autoMode && (
                <button
                  onClick={() => {
                    localStorage.setItem("_course_id_", JSON.stringify(courseId));
                    navigate({ to: "/auto" as any });
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded px-4 py-2 text-[14px] font-bold",
                    "bg-[#f4b829] text-black transition-opacity hover:opacity-90 shadow-sm cursor-pointer",
                  )}
                >
                  <Zap className="h-4 w-4" />
                  Start Auto Mode
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      {!isDrillDown && (
        <div
          className="flex items-center justify-between px-6 border-t border-gray-200"
          style={{ backgroundColor: theme.colors.bg.header }}
        >
          {/* Tabs */}
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const isActive = view === tab.id;
              const Icon = tab.Icon;
              let pathSegment = "";
              switch (tab.id) {
                case COURSE_VIEWS.DASHBOARD:
                  pathSegment = "dashboard";
                  break;
                case COURSE_VIEWS.SESSIONS:
                  pathSegment = "sessions";
                  break;
                case COURSE_VIEWS.STUDENTS:
                  pathSegment = "attendees";
                  break;
                case COURSE_VIEWS.MESSAGES:
                  pathSegment = "messages";
                  break;
              }

              return (
                <Link
                  key={tab.id}
                  to={`/courses/${courseId}/${pathSegment}` as any}
                  className={cn(
                    "relative flex items-center gap-2 px-2 py-3 text-[15px] transition-colors cursor-pointer min-w-[160px]",
                    isActive
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5",
                  )}
                  style={{ textTransform: "none" }}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-link" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: QR Download + Export Report */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportClick}
              disabled={downloading}
              className="flex items-center gap-2 text-[14px] text-[var(--color-text-main)] hover:bg-black/5 px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="h-[20px] w-[20px] text-[var(--color-success-dark)] animate-spin" />
              ) : (
                <FileSpreadsheet className="h-[20px] w-[20px] text-[var(--color-success-dark)]" />
              )}
              {downloading ? "Downloading..." : "Export report..."}
            </button>
          </div>
        </div>
      )}

      {/* Export Report Gateway Dialog */}
      <DownloadReportGatewayDialog
        open={gatewayOpen}
        onOpenChange={setGatewayOpen}
        onSelect={handleGatewaySelect}
      />

      {/* Premium Teaser Dialog (for Standard users) */}
      <DownloadExcelReportTeaser
        open={teaserOpen}
        onOpenChange={setTeaserOpen}
      />

      {/* Start Session Dialog */}
      <StartSessionDialog
        open={startSessionOpen}
        onOpenChange={setStartSessionOpen}
        onSessionStarted={(session) => {
          setStartSessionOpen(false);
          // Enter fullscreen while still in user gesture context (click chain)
          // Browsers block requestFullscreen() outside of click/key events
          try {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } catch {
            /* fullscreen not available */
          }
          navigate({
            to: "/session/$shortid",
            params: { shortid: session.shortId || session.id },
          });
        }}
      />

      {/* Printable QR Sign Dialog */}
      <PrintableSignDialog
        open={printableSignOpen}
        onOpenChange={setPrintableSignOpen}
        courseId={courseId || ""}
        courseName={course?.name || ""}
      />
    </div>
  );
}
