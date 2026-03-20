/**
 * New Course Type Dialog — pick Classroom or Remote Shifts before creating a course.
 * Replaces old NewCourseTypeDialog.js (167 lines).
 * Checks eligibility based on user plan before proceeding.
 */

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { COURSE_TYPES } from "@/config/constants";
import type { CourseType } from "@/config/constants";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCourseStore } from "../store/course.store";

interface NewCourseTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: CourseType) => void;
  onUpgradeNeeded?: (title: string, message: string) => void;
}

function checkIfEligibleToOpenCourse(
  user: Record<string, any>,
  courses: any[] | null,
  courseType: CourseType,
): boolean {
  const pricingTier = user?.pricingTier ?? COURSE_TYPES.CLASSROOM;
  const plan = user?.plan ?? "Standard";

  // Count courses by type — old app uses `fieldCheckin` flag, not `courseType`
  const coursesOfType = (courses ?? []).filter((c: any) => {
    if (courseType === COURSE_TYPES.SHIFTS) return c.fieldCheckin === true;
    return !c.fieldCheckin;
  });

  // First course of any type is always allowed
  if (coursesOfType.length === 0) return true;

  // Standard plan: only 1 course allowed per type
  if (plan === "Standard" && coursesOfType.length > 0) return false;

  // Premium plan: must have matching tier or "COMBINED"
  if (
    plan === "Premium" &&
    (courseType === pricingTier || pricingTier === "COMBINED")
  ) {
    return true;
  }

  return false;
}

export function NewCourseTypeDialog({
  open,
  onOpenChange,
  onSelectType,
  onUpgradeNeeded,
}: NewCourseTypeDialogProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const courses = useCourseStore((s) => s.courses);

  const handleSelect = (type: CourseType) => {
    const isEligible = checkIfEligibleToOpenCourse(
      user ?? {},
      courses,
      type,
    );

    if (!isEligible) {
      onUpgradeNeeded?.(
        "Premium Feature",
        "This feature isn't included in your current plan. Please upgrade your account to access it.",
      );
      onOpenChange(false);
    } else {
      // onSelectType changes parent dialog state to {type:'addCourse'},
      // which makes our `open` prop false — no need to call onOpenChange(false)
      onSelectType(type);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden bg-white text-gray-900">
        <DialogTitle className="sr-only">{t("New Course")}</DialogTitle>
        {/* Title section — matching old app: fontSize 26 bold + fontSize 18 subtitle, centered */}
        <div className="flex flex-col items-center text-center pt-6 pb-2 px-6">
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
            {t("New Course")}
          </h2>
          <p style={{ fontSize: 18, fontWeight: 500, color: "rgba(0,0,0,0.6)" }}>
            {t("What kind of course would you like to create?")}
          </p>
        </div>

        {/* Two-column layout — matching old app widths and vertical divider */}
        <div className="px-6 pb-6">
          <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
            {/* Left: Live Classroom — width 305px, border-right */}
            <div
              style={{
                width: 305,
                borderRight: "solid 1.5px grey",
                paddingRight: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ margin: "10px 10px 30px 10px" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.334, marginBottom: 4 }}>
                  {t("Live Classroom")}
                </h3>
                <p
                  style={{
                    height: 50,
                    fontSize: "1rem",
                    color: "rgba(0,0,0,0.54)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {t("REAL-TIME classroom, remote or hybrid live lesson")}
                </p>
              </div>
              <img
                src="/assets/images/dialogs/New_Live_Course@1x.png"
                alt="Classroom Course"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect(COURSE_TYPES.CLASSROOM as CourseType)}
              />
              <button
                type="button"
                style={{
                  width: 220,
                  marginBottom: 20,
                  marginTop: 18,
                  backgroundColor: COURSE_TYPES.CLASSROOM_COLOR,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  letterSpacing: "0.02857em",
                  lineHeight: 1.75,
                  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                }}
                onClick={() => handleSelect(COURSE_TYPES.CLASSROOM as CourseType)}
              >
                {t("New Live Classroom Course")}
              </button>
            </div>

            {/* Right: Remote Shifts — width 275px, marginLeft 30px */}
            <div
              style={{
                width: 275,
                marginLeft: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ margin: "10px 10px 30px 10px" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.334, marginBottom: 4 }}>
                  {t("Remote Shifts")}
                </h3>
                <p
                  style={{
                    height: 50,
                    fontSize: "1rem",
                    color: "rgba(0,0,0,0.54)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {t(
                    "Attendees will self-check in at a remote venue. For example, during hospital clinical rotation shifts.",
                  )}
                </p>
              </div>
              <img
                src="/assets/images/dialogs/New_Field_Course@1x.png"
                alt="Field Course"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect(COURSE_TYPES.SHIFTS as CourseType)}
              />
              <button
                type="button"
                style={{
                  width: 220,
                  marginBottom: 20,
                  marginTop: 18,
                  backgroundColor: COURSE_TYPES.SHIFTS_COLOR,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  letterSpacing: "0.02857em",
                  lineHeight: 1.75,
                  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                }}
                onClick={() => handleSelect(COURSE_TYPES.SHIFTS as CourseType)}
              >
                {t("New Remote Shifts Course")}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
