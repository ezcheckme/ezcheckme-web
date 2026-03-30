/**
 * Edit Course Dialog — update an existing course.
 * Shared form primitives imported from CourseFormPrimitives.tsx.
 */

import { useState, useEffect } from "react";
import { useCourseStore } from "@/features/courses/store/course.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Course } from "@/shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, MapPin } from "lucide-react";
import { LocationSetupDialog } from "./LocationSetupDialog";
import {
  FloatingInput,
  FloatingSelect,
  LegacyCheckbox,
  LanguageIcon,
  LANGUAGES,
  YEARS,
  TERM_GROUPS,
} from "./CourseFormPrimitives";

type EditCourseDialogProps = {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const currentYear = new Date().getFullYear();

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
}: EditCourseDialogProps) {
  const updateCourse = useCourseStore((s) => s.updateCourse);
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("he");
  const [location, setLocation] = useState<{
    latLng?: { lat: number; lng: number };
    locationText?: string;
  }>({});
  const [internalid, setInternalid] = useState("");
  const [year, setYear] = useState<number>(currentYear);
  const [term, setTerm] = useState("Semester A");
  const [postCheckinMessage, setPostCheckinMessage] = useState("");
  const [postCheckinLink, setPostCheckinLink] = useState("");
  const [room, setRoom] = useState("");

  // Checkboxes
  const [ivrEnabled, setIvrEnabled] = useState(false);
  const [lockCourse, setLockCourse] = useState(false);
  const [enableSessionStartNotifications, setEnableSessionStartNotifications] =
    useState(true);

  // Sub-dialog state
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Conditional visibility (matches old app)
  const showGeolocation = !user?.disablegeolocation;
  const showRoom = !!(user?.autoMode && user?.autoModeRooms?.length);

  useEffect(() => {
    if (course && open) {
      setName(course.name || "");
      setDescription(course.description || "");
      setLanguage(course.language || "he");
      // Restore location object from course data
      const loc = course.location as Record<string, unknown> | undefined;
      if (loc?.latLng) {
        setLocation({
          latLng: loc.latLng as { lat: number; lng: number },
          locationText: (loc.locationText as string) || (loc.address as string) || "",
        });
      } else if (loc?.address) {
        setLocation({ locationText: loc.address as string });
      } else {
        setLocation({});
      }
      setInternalid(course.internalid || "");
      setYear(course.year || currentYear);
      setTerm(course.term || "Semester A");
      // postCheckinUrl can be an object {message, url} or a string
      const pcUrl = course.postCheckinUrl;
      if (pcUrl && typeof pcUrl === "object") {
        setPostCheckinMessage(
          (pcUrl as { message: string; url: string }).message || "",
        );
        setPostCheckinLink(
          (pcUrl as { message: string; url: string }).url || "",
        );
      } else {
        setPostCheckinMessage(typeof pcUrl === "string" ? pcUrl : "");
        setPostCheckinLink("");
      }
      setIvrEnabled(course.ivrenabled || false);
      // Room — init from course or first user room
      if (showRoom) {
        setRoom(
          ((course as unknown as Record<string, unknown>).room as string) ||
          user?.autoModeRooms?.[0] ||
          "",
        );
      }
    }
  }, [course, open, showRoom, user?.autoModeRooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !course) return;

    try {
      setLoading(true);
      await updateCourse({
        id: course.id,
        name,
        description,
        language,
        location: location.latLng
          ? {
              latLng: location.latLng,
              locationText: location.locationText,
              address: location.locationText,
            }
          : undefined,
        internalid,
        year,
        term,
        postCheckinUrl: postCheckinMessage
          ? { message: postCheckinMessage, url: postCheckinLink }
          : undefined,
        ivrenabled: ivrEnabled,
        room: room || undefined,
      } as Parameters<typeof updateCourse>[0]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update course", error);
      alert("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white text-gray-900">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-[1.25rem] font-normal text-[rgba(0,0,0,0.87)] tracking-tight">
            Edit Course
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <div className="flex flex-col gap-5">
            {/* Course Name */}
            <FloatingInput
              label="Course Name"
              value={name}
              onChange={setName}
              required
              autoFocus
            />

            {/* Course Description */}
            <FloatingInput
              label="Course Description"
              value={description}
              onChange={setDescription}
            />

            {/* Language */}
            <FloatingSelect
              label="Language"
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
              <FloatingSelect label="Room" value={room} onChange={setRoom}>
                {user?.autoModeRooms?.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </FloatingSelect>
            )}

            {/* Course Location — clicks open LocationSetupDialog */}
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
                    location.locationText ? { paddingLeft: 40 } : undefined
                  }
                />
                <label className="absolute left-3 -top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none">
                  Course Location (Mandatory for Geolocation)
                </label>
                {location.locationText && (
                  <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                )}
                <span className="absolute right-3 top-4 text-[12px] text-gray-500 underline hover:text-black cursor-pointer">
                  {location.locationText ? "Manage..." : "Set Up..."}
                </span>
              </div>
            )}

            {/* Course ID */}
            <FloatingInput
              label="Course ID"
              value={internalid}
              onChange={setInternalid}
            />

            {/* Year */}
            <FloatingSelect
              label="Year"
              value={year}
              onChange={(v) => setYear(Number(v))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </FloatingSelect>

            {/* Term */}
            <FloatingSelect label="Term" value={term} onChange={setTerm}>
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
            <div className="relative">
              <input
                type="text"
                value={postCheckinMessage}
                onChange={(e) => setPostCheckinMessage(e.target.value)}
                className="w-full h-14 px-3 pr-20 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
                placeholder="Post Check-In Message..."
              />
              <label className="absolute left-3 -top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none">
                Post check-in message
              </label>
              <button
                type="button"
                className="absolute right-3 top-4 text-[13px] text-gray-500 uppercase tracking-wide hover:bg-black/5 px-2 py-1 rounded"
              >
                Set Up...
              </button>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2 mt-2">
              <LegacyCheckbox
                checked={ivrEnabled}
                onChange={setIvrEnabled}
                label="Allow IVR Check-in (לבעלי טלפונים כשרים)"
                tooltip="Allow students to check-in via IVR phone system"
              />
              <LegacyCheckbox
                checked={lockCourse}
                onChange={setLockCourse}
                label="Lock course"
                tooltip="Prevent new students from joining this course"
              />
              <LegacyCheckbox
                checked={enableSessionStartNotifications}
                onChange={setEnableSessionStartNotifications}
                label="Enable session start notifications"
                tooltip="Send notifications when a session begins"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4">
            <Button
              type="button"
              className="bg-[#039be5] hover:bg-[#0288d1] text-white rounded shadow-sm text-[13px] uppercase px-4 h-9 font-medium tracking-wide"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-[#0277bd] hover:bg-[#01579b] text-white rounded shadow-sm text-[13px] uppercase px-4 h-9 font-medium tracking-wide flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-[18px] h-[18px]" />
              {loading ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Location Setup Sub-dialog */}
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
    </Dialog>
  );
}
