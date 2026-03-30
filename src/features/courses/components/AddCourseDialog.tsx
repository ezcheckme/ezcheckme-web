/**
 * Add Course Dialog — create a new course.
 * Matches old UpdateCourseDialog.js "new" mode with ALL fields:
 * name, faculty, description, language, room, geolocation, internalid,
 * year, term, postCheckinUrl, IVR, lockDynamicAddingAttendees,
 * sessionStartNotificationEnabled.
 *
 * Shared form primitives extracted to CourseFormPrimitives.tsx.
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loader2, Save, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "../../courses/store/course.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { COURSE_TYPES } from "@/config/constants";
import { PostCheckInUrlDialog } from "./PostCheckInUrlDialog";
import { LocationSetupDialog } from "./LocationSetupDialog";
import { CourseTemplates } from "./CourseTemplates";
import type { CourseTemplate } from "@/shared/types";
import {
  FloatingInput,
  FloatingSelect,
  LegacyCheckbox,
  LanguageIcon,
  LANGUAGES,
  YEARS,
  TERM_GROUPS,
  validateCourseName,
  validateCourseDescription,
} from "./CourseFormPrimitives";

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseType?: string;
}

const currentYear = new Date().getFullYear();

export function AddCourseDialog({
  open,
  onOpenChange,
  courseType,
}: AddCourseDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCourse = useCourseStore((s) => s.createCourse);
  const user = useAuthStore((s) => s.user);

  // --- Form state matching old app's UpdateCourseDialog.state ---
  const [template, setTemplate] = useState<CourseTemplate | null>(null);
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [room, setRoom] = useState("");
  const [location, setLocation] = useState<{
    latLng?: { lat: number; lng: number };
    locationText?: string;
  }>({});
  const [internalid, setInternalid] = useState("");
  const [year, setYear] = useState(currentYear);
  const [term, setTerm] = useState("Semester A");
  const [postCheckinUrl, setPostCheckinUrl] = useState<{
    message: string;
    url: string;
  } | null>(null);
  const [ivrenabled, setIvrenabled] = useState(false);
  const [lockDynamicAddingAttendees, setLockDynamicAddingAttendees] =
    useState(false);
  const [sessionStartNotificationEnabled, setSessionStartNotificationEnabled] =
    useState(false);

  // --- Template onChange handler (matches old app's contentChange) ---
  const handleTemplateChange = (field: string, value: unknown) => {
    switch (field) {
      case "template":
        setTemplate(value as CourseTemplate | null);
        break;
      case "language":
        setLanguage(value as string);
        break;
      case "location":
        setLocation(value ? { latLng: value as { lat: number; lng: number } } : {});
        break;
      case "ivrenabled":
        setIvrenabled(value as boolean);
        break;
      case "postCheckinUrl":
        setPostCheckinUrl(value as { message: string; url: string } | null);
        break;
    }
  };

  // Sub-dialog states
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [postCheckinDialogOpen, setPostCheckinDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");

  // Derived from courseType
  const isShifts = courseType === COURSE_TYPES.SHIFTS;

  // --- Conditional visibility flags (match old app exactly) ---
  const showFaculty = !!(user?.faculties && user.faculties.length > 0);
  const showRoom = !!(user?.autoMode && user?.autoModeRooms?.length);
  const showGeolocation = !user?.disablegeolocation;
  const showIvr =
    !isShifts && !!(user?.ivrenabled || ivrenabled);
  const showLockDynamic = !!user?.enableCourseDynamicJoinLock;
  const showSessionNotification = !!user?.sessionStartNotificationEnabled;

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevUser, setPrevUser] = useState(user);

  // --- Initialize defaults based on user ---
  if (open !== prevOpen || user !== prevUser) {
    setPrevOpen(open);
    setPrevUser(user);
    if (open) {
      // Reset form
      setName("");
      setFaculty("");
      setDescription("");
      setLanguage("en");
      setRoom(user?.autoModeRooms?.[0] ?? "");
      setLocation({});
      setInternalid("");
      setYear(currentYear);
      setTerm("Semester A");
      setPostCheckinUrl(null);
      setIvrenabled(false);
      setLockDynamicAddingAttendees(false);
      setSessionStartNotificationEnabled(
        !!(
          user?.sessionStartNotificationEnabled &&
          user?.sessionStartNotificationEnabledByDefault
        ),
      );
      setLoading(false);
      setNameError("");
      setDescError("");
    }
  }

  const isValid =
    name.trim().length >= 3 &&
    !nameError &&
    !descError &&
    (!showFaculty || faculty !== "");

  // --- Get title (match old app's getTitle logic) ---
  const getTitle = () => {
    if (isShifts) return t("New Remote Shifts Course");
    return t("New Live Classroom Course");
  };

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const newCourseId = await createCourse({
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        internalid: internalid.trim() || undefined,
        year,
        term,
        faculty: faculty || undefined,
        room: room || undefined,
        location: location.latLng
          ? { ...location.latLng, address: location.locationText }
          : undefined,
        postCheckinUrl: postCheckinUrl ?? undefined,
        fieldCheckin: isShifts,
        ivrenabled: ivrenabled || undefined,
        lockDynamicAddingAttendees:
          lockDynamicAddingAttendees || undefined,
        sessionStartNotificationEnabled:
          sessionStartNotificationEnabled || undefined,
        iconQuizEnabled: true,
      });
      onOpenChange(false);
      if (newCourseId) {
        navigate({ to: `/courses/${newCourseId}` as string });
      }
    } catch (error) {
      console.error("Failed to create course:", error);
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v && !loading) onOpenChange(false);
        }}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white text-gray-900">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-[1.25rem] font-normal text-[rgba(0,0,0,0.87)] tracking-tight">
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
            <div className="flex flex-col gap-4">
              {/* Templates (conditional — only for group managers or if templates exist) */}
              <CourseTemplates
                template={template}
                onChange={handleTemplateChange}
                courseData={{
                  language,
                  location: location.latLng ?? null,
                  ivrenabled,
                  postCheckinUrl,
                  iconQuizEnabled: true,
                }}
              />

              {/* Course Name (required, minLength 3, maxLength 50) */}
              <FloatingInput
                label={t("edit course - name") || "Course Name"}
                value={name}
                onChange={(v) => {
                  setName(v);
                  setNameError(validateCourseName(v));
                }}
                required
                autoFocus
                maxLength={50}
                error={nameError}
              />

              {/* Faculty (conditional — only if user has faculties) */}
              {showFaculty && (
                <FloatingSelect
                  label="Faculty"
                  value={faculty}
                  onChange={setFaculty}
                >
                  <option value="" disabled>
                    Select Faculty *
                  </option>
                  {user?.faculties?.map((f) => {
                    const fid = f.id ?? f._id ?? "";
                    return (
                      <option key={fid} value={fid}>
                        {f.name}
                      </option>
                    );
                  })}
                </FloatingSelect>
              )}

              {/* Course Description (optional, minLength 3 if filled) */}
              <FloatingInput
                label={t("edit course - description") || "Course Description"}
                value={description}
                onChange={(v) => {
                  setDescription(v);
                  setDescError(validateCourseDescription(v));
                }}
                error={descError}
              />

              {/* Language */}
              <FloatingSelect
                label={t("edit course - language") || "Language"}
                value={language}
                onChange={setLanguage}
                icon={<LanguageIcon />}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </FloatingSelect>

              {/* Room (conditional — only if user has autoMode with rooms) */}
              {showRoom && (
                <FloatingSelect
                  label="Room"
                  value={room}
                  onChange={setRoom}
                >
                  {user?.autoModeRooms?.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </FloatingSelect>
              )}

              {/* Geolocation (conditional — only if not disabled) */}
              {showGeolocation && (
                <div
                  className="relative cursor-pointer"
                  onClick={() => setLocationDialogOpen(true)}
                >
                  <input
                    type="text"
                    value={location.locationText || ""}
                    readOnly
                    className="w-full h-14 px-3 pr-20 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent cursor-pointer"
                    style={
                      location.locationText
                        ? { paddingLeft: 40 }
                        : undefined
                    }
                  />
                  <label className="absolute left-3 -top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none">
                    {t("edit course - location") ||
                      "Course Location (Mandatory for Geolocation)"}
                  </label>
                  {location.locationText && (
                    <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                  )}
                  <span className="absolute right-3 top-4 text-[12px] text-gray-500 underline hover:text-black cursor-pointer">
                    {t("edit course - location button setup") || "Set Up..."}
                  </span>
                </div>
              )}

              {/* Internal course ID */}
              <FloatingInput
                label={t("edit course - id") || "Course ID"}
                value={internalid}
                onChange={setInternalid}
              />

              {/* Year */}
              <FloatingSelect
                label={t("edit course - year") || "Year"}
                value={year}
                onChange={(v) => setYear(Number(v))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </FloatingSelect>

              {/* Term (grouped dropdown matching old app) */}
              <FloatingSelect
                label={t("edit course - term") || "Term"}
                value={term}
                onChange={setTerm}
              >
                {TERM_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={`${group.label}-${item}`} value={item}>
                        • {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other">Other</option>
              </FloatingSelect>

              {/* Post check-in message */}
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  if (user?.plan !== "Premium") {
                    useAuthStore.getState().openPricingDialog(
                      t("pricing table - premium upgrade title"),
                      t("pricing table - premium account required text"),
                    );
                  } else {
                    setPostCheckinDialogOpen(true);
                  }
                }}
              >
                <div className="w-full min-h-[52px] px-3 pr-20 pt-4 pb-2 text-[16px] border border-gray-300 rounded-[4px] flex items-center relative">
                  <label className="absolute left-3 -top-2.5 text-[11px] text-gray-500 bg-white px-1 pointer-events-none">
                    Post check-in message
                  </label>
                  <span className="text-[15px] text-gray-600">
                    {postCheckinUrl?.message || "Post Check-In Message..."}
                  </span>
                  <span className="absolute right-3 top-4 text-[12px] text-gray-500 underline hover:text-black cursor-pointer">
                    {postCheckinUrl?.message
                      ? t("edit course - location button manage") || "Manage..."
                      : t("edit course - location button setup") || "Set Up..."}
                  </span>
                </div>
              </div>

              {/* Conditional Checkboxes */}
              <div className="flex flex-col gap-2 mt-1">
                {/* IVR: only if (userIvrEnabled || ivrenabled) AND not shifts */}
                {showIvr && (
                  <LegacyCheckbox
                    checked={ivrenabled}
                    onChange={setIvrenabled}
                    disabled={user?.plan !== "Premium"}
                    label={
                      t("edit course - enable ivr") ||
                      "Allow IVR Check-in (לבעלי טלפונים כשרים)"
                    }
                    tooltip={
                      t("edit course - enable ivr tooltip") ||
                      "Allow students to check-in via IVR phone system"
                    }
                  />
                )}

                {/* Lock Dynamic Adding Attendees */}
                {showLockDynamic && (
                  <LegacyCheckbox
                    checked={lockDynamicAddingAttendees}
                    onChange={setLockDynamicAddingAttendees}
                    disabled={user?.plan !== "Premium"}
                    label={
                      t(
                        "edit course - enable lock dynamic adding attendees",
                      ) || "Lock dynamic adding attendees"
                    }
                    tooltip={
                      t(
                        "edit course - enable lock dynamic adding attendees tooltip",
                      ) ||
                      "Prevent new students from dynamically joining this course"
                    }
                  />
                )}

                {/* Session Start Notifications */}
                {showSessionNotification && (
                  <LegacyCheckbox
                    checked={sessionStartNotificationEnabled}
                    onChange={setSessionStartNotificationEnabled}
                    disabled={user?.plan !== "Premium"}
                    label={
                      t("edit course - enable session start notifications") ||
                      "Enable session start notifications"
                    }
                    tooltip={
                      t(
                        "edit course - enable session start notifications tooltip",
                      ) || "Send notifications when a session begins"
                    }
                  />
                )}
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4">
              <Button
                type="button"
                className="bg-[#039be5] hover:bg-[#0288d1] text-white rounded shadow-sm text-[13px] uppercase px-4 h-9 font-medium tracking-wide"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t("edit course - cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={loading || !isValid}
                className="bg-[#0277bd] hover:bg-[#01579b] text-white rounded shadow-sm text-[13px] uppercase px-4 h-9 font-medium tracking-wide flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-[18px] h-[18px]" />
                {loading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  t("edit course - save") || "Save Course"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <LocationSetupDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        initialLocation={
          location.latLng
            ? {
                latLng: location.latLng,
                locationText: location.locationText || "",
              }
            : null
        }
        onSave={(data) => {
          setLocation({
            latLng: data.latLng,
            locationText: data.locationText,
          });
        }}
      />

      {postCheckinDialogOpen && (
        <PostCheckInUrlDialog
          open={postCheckinDialogOpen}
          onClose={() => setPostCheckinDialogOpen(false)}
          onSave={(data) => {
            setPostCheckinUrl(data);
          }}
          initialData={postCheckinUrl}
        />
      )}
    </>
  );
}
