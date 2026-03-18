/**
 * Start Session Dialog — pre-session configuration with course selection,
 * name, duration, and advanced options (geofencing, icon quiz).
 *
 * Source: old StartSession.js (582 lines) → decomposed into ~250 lines.
 * Supports both "Start Session" and "Resume Session" modes.
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { theme } from "@/config/theme";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCourseStore } from "../../courses/store/course.store";
import { useSessionStore } from "../../courses/store/session.store";
import { STORAGE_KEYS } from "@/config/constants";
import type { Session } from "@/shared/types";

// ---------------------------------------------------------------------------
// Duration options
// ---------------------------------------------------------------------------

const DURATION_VALUES = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 0];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog acts as "Resume Session" */
  resumedSession?: Session | null;
  /** Callback after session is created/resumed */
  onSessionStarted?: (session: Session) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StartSessionDialog({
  open,
  onOpenChange,
  resumedSession,
  onSessionStarted,
}: StartSessionDialogProps) {
  const { t } = useTranslation();
  const courses = useCourseStore((s) => s.courses) ?? [];
  const courseId = useCourseStore((s) => s.courseId);
  const createSession = useSessionStore((s) => s.createSession);
  const resumeSessionFn = useSessionStore((s) => s.resumeSession);

  // Form state
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ?? "");
  const [sessionName, setSessionName] = useState("");
  const [duration, setDuration] = useState(7);
  const [iconQuizEnabled, setIconQuizEnabled] = useState(true);
  const [useGeofencing, setUseGeofencing] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Selected course object
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return;

    setSelectedCourseId(courseId ?? courses[0]?.id ?? "");
    setLoading(false);
    setAdvancedOpen(false);

    // Duration from localStorage
    const savedDuration = localStorage.getItem(STORAGE_KEYS.SESSION_DURATION);
    if (savedDuration) {
      const parsed = JSON.parse(savedDuration);
      if (typeof parsed === "number") setDuration(parsed);
    }

    if (resumedSession) {
      setSessionName(resumedSession.name || "");
    } else {
      const course = courses.find((c) => c.id === (courseId ?? courses[0]?.id));
      const courseAny = course as unknown as Record<string, unknown>;
      const sessionNum = courseAny?.counter ? String(courseAny.counter) : "1";
      setSessionName(`${t("start-session - default session")} ${sessionNum}`);
    }
  }, [open, courseId, courses, resumedSession, t]);

  // Update icon quiz from course when course changes
  useEffect(() => {
    if (selectedCourse) {
      const courseData = selectedCourse as unknown as Record<string, unknown>;
      if ("iconQuizEnabled" in courseData) {
        setIconQuizEnabled(true);
      }
    }
  }, [selectedCourse]);

  const isValid = sessionName.trim().length >= 3 && selectedCourseId;

  async function handleSubmit() {
    if (!isValid || !selectedCourse) return;
    setLoading(true);

    try {
      const courseData = selectedCourse as unknown as Record<string, unknown>;

      const sessionData: Record<string, unknown> = {
        course: selectedCourse,
        name: sessionName.trim(),
        duration,
        icongroup: courseData.ivrenabled
          ? iconQuizEnabled
            ? "IVR_Abstract"
            : "IVR_No_Icon_Quiz"
          : "Abstract",
        iconQuizEnabled,
        ivrEnabled: courseData.ivrenabled,
        qrinterval: courseData.qrinterval,
      };

      if (useGeofencing) {
        sessionData.location = courseData.location;
      }

      let session: Session;
      if (resumedSession) {
        session = await resumeSessionFn(
          sessionData,
          selectedCourseId,
          resumedSession.id,
        );
      } else {
        session = await createSession(sessionData);
      }

      // Save duration preference
      localStorage.setItem(
        STORAGE_KEYS.SESSION_DURATION,
        JSON.stringify(duration),
      );

      // ---- Finalize: store full session data for SessionProvider ----
      const liveData = {
        id: session.id,
        shortid:
          (session as unknown as Record<string, unknown>).shortId ||
          (session as unknown as Record<string, unknown>).shortid ||
          session.id,
        courseid: session.courseId || selectedCourseId,
        coursename: selectedCourse.name || "",
        name: sessionName.trim(),
        duration,
        begins: new Date().toISOString(),
        checkins: (session as unknown as Record<string, unknown>).checkins || 0,
        language: courseData.language || "en",
        theme: {
          bgColor:
            courseData.bgColor ||
            (courseData.theme as Record<string, unknown>)?.bgColor ||
            "",
          image:
            courseData.logo ||
            (courseData.theme as Record<string, unknown>)?.image ||
            "",
        },
        ivrEnabled: !!courseData.ivrenabled,
        iconQuizEnabled,
        mode: session.mode || "manual",
        qrinterval: courseData.qrinterval || null,
        icongroup: courseData.ivrenabled
          ? iconQuizEnabled
            ? "IVR_Abstract"
            : "IVR_No_Icon_Quiz"
          : "Abstract",
        location: useGeofencing ? courseData.location : undefined,
      };

      localStorage.setItem("_session_", JSON.stringify(liveData));

      const initialCount =
        (session as unknown as Record<string, unknown>).checkins || 0;
      localStorage.setItem("_sesstion_count_", JSON.stringify(initialCount));

      if (courseData.qrinterval) {
        localStorage.setItem(
          "_qrinterval_",
          JSON.stringify(courseData.qrinterval),
        );
      }

      onSessionStarted?.(session);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to start session:", error);
      setLoading(false);
    }
  }

  // Store handleSubmit in ref for Enter key handler (avoids stale closure)
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Enter key submits
  useEffect(() => {
    if (!open) return;
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Enter" && !loading) handleSubmitRef.current();
    }
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [open, loading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {resumedSession
              ? t("start-session - resume session title")
              : t("start-session - title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Course selector */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <Label className="text-sm text-gray-600">
              {t("start-session - course")}
            </Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={!!resumedSession}
            >
              <SelectTrigger className="border-0 border-b border-gray-400 rounded-none shadow-none bg-transparent px-0 focus:ring-0 focus:border-black">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px] overflow-y-auto bg-white">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session name */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <Label className="text-sm text-gray-600">
              {t("start-session - session name")}
            </Label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              maxLength={20}
              disabled={!!resumedSession}
              placeholder="Session name"
              className={cn(
                "border-0 border-b border-gray-400 rounded-none shadow-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black",
                sessionName.trim().length > 0 &&
                  sessionName.trim().length < 3 &&
                  "border-red-400",
              )}
            />
          </div>

          {/* Duration */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <Label className="text-sm text-gray-600">
              {t("start-session - session duration")}
            </Label>
            <Select
              value={String(duration)}
              onValueChange={(v) => {
                setDuration(Number(v));
                localStorage.setItem(
                  "_session_registration_length_",
                  JSON.stringify(Number(v)),
                );
              }}
            >
              <SelectTrigger className="border-0 border-b border-gray-400 rounded-none shadow-none bg-transparent px-0 focus:ring-0 focus:border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[250px] overflow-y-auto bg-white">
                {DURATION_VALUES.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d === 0
                      ? t("start-session - unlimited")
                      : `${d} ${t("start-session - minutes")}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced options toggle */}
          {/* moved to footer */}

          {/* Advanced options */}
          {advancedOpen && (
            <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50/50 p-4">
              {/* Geofencing */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="geofencing"
                  checked={useGeofencing}
                  onCheckedChange={(checked) =>
                    setUseGeofencing(checked === true)
                  }
                />
                <Label
                  htmlFor="geofencing"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {t("start-session - use geofencing") || "Use Geofencing"}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        {t("start-session - use geofencing info") ||
                          "Verify attendees are at the session location using GPS"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Icon Quiz */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="iconQuiz"
                  checked={iconQuizEnabled}
                  onCheckedChange={(checked) =>
                    setIconQuizEnabled(checked === true)
                  }
                />
                <Label
                  htmlFor="iconQuiz"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {t("start-session - icon quiz") || "Enable Icon Quiz"}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        Attendees must identify the icon shown on the session
                        screen to verify they are physically present.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-2">
          {/* Advanced options toggle — left side */}
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {advancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {advancedOpen ? "Hide advanced options" : "Show advanced options"}
          </button>

          {/* Cancel + Run Session — right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
            >
              {t("start-session - cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={cn(
                "inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold text-white transition-opacity cursor-pointer",
                !isValid || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90",
              )}
              style={{
                background:
                  !isValid || loading
                    ? "#d5babd"
                    : theme.colors.button.dangerAlt,
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </span>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  {resumedSession
                    ? "Resume Session"
                    : t("start-session - run session")}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
