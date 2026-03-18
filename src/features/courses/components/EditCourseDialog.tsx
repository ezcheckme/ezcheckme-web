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
import { HelpCircle, Save, MapPin } from "lucide-react";
import { LocationSetupDialog } from "./LocationSetupDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EditCourseDialogProps = {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Mock terms array based on legacy
const terms = ["Semester A", "Semester B", "Summer Semester"];
const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear + 1];

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
}: EditCourseDialogProps) {
  const updateCourse = useCourseStore((s) => s.updateCourse);
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("he"); // default hebrew per screenshot
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
      const loc = course.location as any;
      if (loc?.latLng) {
        setLocation({ latLng: loc.latLng, locationText: loc.locationText || loc.address || "" });
      } else if (loc?.address) {
        setLocation({ locationText: loc.address });
      } else {
        setLocation({});
      }
      setInternalid(course.internalid || "");
      setYear(course.year || currentYear);
      setTerm(course.term || "Semester A");
      // postCheckinUrl can be an object {message, url} or a string
      const pcUrl = course.postCheckinUrl;
      if (pcUrl && typeof pcUrl === "object") {
        setPostCheckinMessage((pcUrl as { message: string; url: string }).message || "");
        setPostCheckinLink((pcUrl as { message: string; url: string }).url || "");
      } else {
        setPostCheckinMessage(typeof pcUrl === "string" ? pcUrl : "");
        setPostCheckinLink("");
      }
      setIvrEnabled(course.ivrenabled || false);
      // Room — init from course or first user room
      if (showRoom) {
        setRoom((course as any).room || user?.autoModeRooms?.[0] || "");
      }
      // Ensure defaults if missing from mock backend
    }
  }, [course, open]);

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
          ? { latLng: location.latLng, locationText: location.locationText, address: location.locationText }
          : undefined,
        internalid,
        year,
        term,
        postCheckinUrl: postCheckinMessage ? { message: postCheckinMessage, url: postCheckinLink } : undefined,
        ivrenabled: ivrEnabled,
        room: room || undefined,
      } as any);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update course", error);
      alert("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const HelpIcon = ({ tooltip }: { tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button" tabIndex={-1}>
          <HelpCircle className="w-[14px] h-[14px] text-gray-500 ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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
            {/* Templates */}
            <div className="relative">
              <select
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  Templates...
                </option>
                {/* Options would go here */}
              </select>
              <label className="absolute left-3 top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none transition-all">
                Templates...
              </label>
              <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>

            {/* Course Name */}
            <div className="relative mt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-[var(--color-secondary)] rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
                required
              />
              <label className="absolute left-3 -top-2 text-[12px] text-[var(--color-secondary)] bg-white px-1 pointer-events-none transition-all">
                Course Name *
              </label>
            </div>

            {/* Course Description */}
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
              />
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
                Course Description
              </label>
            </div>

            {/* Language */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-14 px-10 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
              >
                <option value="en">English</option>
                <option value="he">עברית</option>
                <option value="ar">العربية</option>
              </select>
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
                Language
              </label>
              <div className="absolute left-3 top-4 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>

            {/* Room (conditional — only if user has autoMode with rooms) */}
            {showRoom && (
              <div className="relative">
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
                >
                  {user?.autoModeRooms?.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <label className="absolute left-3 -top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none">
                  Room
                </label>
                <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
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
                    location.locationText
                      ? { paddingLeft: 40 }
                      : undefined
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
            <div className="relative">
              <input
                type="text"
                value={internalid}
                onChange={(e) => setInternalid(e.target.value)}
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
              />
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
                Course ID
              </label>
            </div>

            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
                Year
              </label>
              <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>

            {/* Term */}
            <div className="relative">
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
              >
                {terms.map((t) => (
                  <option key={t} value={t}>
                    • {t}
                  </option>
                ))}
              </select>
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
                Term
              </label>
              <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>

            {/* Post check-in message */}
            <div className="relative">
              <input
                type="text"
                value={postCheckinMessage}
                onChange={(e) => setPostCheckinMessage(e.target.value)}
                className="w-full h-14 px-3 pr-20 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
                placeholder="Post Check-In Message..."
              />
              <label className="absolute left-3 top-4 text-[16px] text-gray-500 pointer-events-none transition-all origin-left transform -translate-y-[1.4rem] scale-[0.75] bg-white px-1">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-colors ${ivrEnabled ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]" : "border-gray-400"}`}
                >
                  {ivrEnabled && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={ivrEnabled}
                  onChange={(e) => setIvrEnabled(e.target.checked)}
                />
                <span className="text-[15px] text-gray-600 flex items-center">
                  Allow IVR Check-in (לבעלי טלפונים כשרים)
                  <HelpIcon tooltip="Allow students to check-in via IVR phone system" />
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-colors ${lockCourse ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]" : "border-gray-400"}`}
                >
                  {lockCourse && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={lockCourse}
                  onChange={(e) => setLockCourse(e.target.checked)}
                />
                <span className="text-[15px] text-gray-600 flex items-center">
                  Lock course
                  <HelpIcon tooltip="Prevent new students from joining this course" />
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-colors ${enableSessionStartNotifications ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]" : "border-gray-400"}`}
                >
                  {enableSessionStartNotifications && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={enableSessionStartNotifications}
                  onChange={(e) =>
                    setEnableSessionStartNotifications(e.target.checked)
                  }
                />
                <span className="text-[15px] text-gray-600 flex items-center">
                  Enable session start notifications
                  <HelpIcon tooltip="Send notifications when a session begins" />
                </span>
              </label>
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
