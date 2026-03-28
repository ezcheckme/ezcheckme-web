/**
 * Course list panel — left side of courses page.
 * Matches: CourseList.js (534 lines), CourseLine.js, CourseLineColor.js
 *
 * React 19 refactor:
 * - Radix DropdownMenu replaces hand-rolled context menu
 * - Radix Switch replaces hand-rolled toggle
 * - Dialog state consolidated into discriminated union
 * - Active/hidden course lists deduplicated
 * - Inline styles → Tailwind classes
 */

import { useState, useEffect, useMemo } from "react";
import { BookOpen, MoreVertical, Trash2, Edit, Eye } from "lucide-react";
import { useCourseStore } from "../store/course.store";
import type { Course } from "@/shared/types";
import type { CourseType } from "@/config/constants";
import { EditCourseDialog } from "./EditCourseDialog";
import { NewCourseTypeDialog } from "./NewCourseTypeDialog";
import { AddCourseDialog } from "./AddCourseDialog";
import { SendInstructionsDialog } from "./SendInstructionsDialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

// ---------------------------------------------------------------------------
// Dialog state — discriminated union replaces 6 separate useState calls
// ---------------------------------------------------------------------------

type DialogState =
  | { type: "none" }
  | { type: "editCourse"; course: Course }
  | { type: "courseType" }
  | { type: "addCourse"; courseType: CourseType }
  | { type: "share" };

// ---------------------------------------------------------------------------
// CourseList
// ---------------------------------------------------------------------------

export function CourseList() {
  const courses = useCourseStore((s) => s.courses);
  const courseId = useCourseStore((s) => s.courseId);
  const loading = useCourseStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const canAddCourse = !(user?.groupmanager && user?.adminRights?.allow_add_course === false);
  const getCourses = useCourseStore((s) => s.getCourses);
  const selectCourse = useCourseStore((s) => s.selectCourse);
  const updateCourse = useCourseStore((s) => s.updateCourse);
  const deleteCourse = useCourseStore((s) => s.deleteCourse);
  const navigate = useNavigate();

  const [showHidden, setShowHidden] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });

  useEffect(() => {
    getCourses();
  }, [getCourses]);
  
  const handleSelectCourse = (id: string) => {
    selectCourse(id);
    // Navigate directly to the default tab to avoid an extra redirect through CourseDefaultRedirector
    const course = courses?.find((c) => c.id === id);
    const defaultTab = course?.fieldCheckin ? "attendees" : "sessions";
    navigate({ to: `/courses/${id}/${defaultTab}` as any, replace: true });
  };

  const activeCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => c.status === "active" || !c.status);
  }, [courses]);

  const hiddenCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter(
      (c) => c.status === "hidden" || c.status === "inactive",
    );
  }, [courses]);


  const courseCount = courses?.length ?? 0;

  return (
    <div
      className="flex h-full flex-col shrink-0"
      style={{
        width: 300,
        borderRight: "1px solid #e0e0e0",
      }}
    >
      {/* Header — "My Courses (N)" + Add button */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2
            className="m-0"
            style={{ color: "#20486a", fontWeight: 600, fontSize: "1.5rem" }}
          >
            My Courses ({courseCount})
          </h2>
          {canAddCourse && (
            <button
              className="flex items-center justify-center cursor-pointer"
              title="New Course"
              onClick={() => setDialog({ type: "courseType" })}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              {/* MUI AddCircle icon matching old app */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={canAddCourse ? "#224866" : "#b8c4cc"}
                style={{ cursor: canAddCourse ? "pointer" : "default", marginRight: 13 }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Course list (Scrollable area) */}
      <div
        className="flex-1 overflow-y-auto m-4"
        style={{
          boxShadow: "0px 0px 1px 0px rgba(0,0,0,0.24)",
          border: "1px solid rgba(0,0,0,0.2)",
          maxHeight: "calc(100vh - 200px)",
          background: "#fff",
        }}
      >
        {loading && !courses && (
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center h-12 bg-white"
                style={{ borderBottom: "1px solid #e0e0e0" }}
              >
                <Skeleton width={4} height="100%" borderRadius={0} className="shrink-0" />
                <div className="flex-1 pl-4 pr-3">
                  <Skeleton height={12} width={`${65 + i * 5}%`} borderRadius={3} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeCourses.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <BookOpen className="h-8 w-8 text-gray-300" />
            <p className="text-xs text-gray-500">No courses yet</p>
          </div>
        )}

        {/* Active courses */}
        {activeCourses.map((course) => (
          <CourseListItem
            key={course.id}
            course={course}
            isActive={course.id === courseId}
            onSelect={() => handleSelectCourse(course.id)}
            onHide={() => updateCourse({ id: course.id, status: "hidden" })}
            onActivate={() => updateCourse({ id: course.id, status: "active" })}
            isHidden={false}
            onDelete={async () => {
              if (
                confirm(
                  `Are you sure you want to delete course "${course.name}"?`,
                )
              ) {
                await deleteCourse(course.id);
              }
            }}
            onEdit={() => setDialog({ type: "editCourse", course })}
          />
        ))}

        {/* Show hidden courses toggle */}
        <div
          className="flex items-center justify-between cursor-pointer select-none h-12 bg-white"
          style={{
            paddingLeft: 16,
            paddingRight: 12,
            borderBottom: "1px solid #e0e0e0",
          }}
          onClick={() => setShowHidden(!showHidden)}
        >
          <span className="text-sm font-normal text-[rgba(0,0,0,0.87)] font-[Roboto,Helvetica,Arial,sans-serif]">
            Show hidden courses
          </span>
          <Switch
            checked={showHidden}
            onCheckedChange={setShowHidden}
            className="h-3.5 w-[34px] data-[state=checked]:bg-[rgba(25,118,210,0.5)] data-[state=unchecked]:bg-[rgba(0,0,0,0.38)] [&>span]:h-5 [&>span]:w-5 [&>span]:-translate-y-[3px] [&>span]:data-[state=checked]:translate-x-3.5 [&>span]:data-[state=unchecked]:-translate-x-[3px] [&>span]:data-[state=checked]:bg-[#1976d2] [&>span]:data-[state=unchecked]:bg-[#fafafa] [&>span]:shadow-md"
          />
        </div>

        {/* Hidden courses — shown below the toggle when enabled */}
        {showHidden &&
          hiddenCourses.map((course) => (
            <CourseListItem
              key={course.id}
              course={course}
              isActive={course.id === courseId}
              onSelect={() => handleSelectCourse(course.id)}
              onHide={() => updateCourse({ id: course.id, status: "hidden" })}
              onActivate={() => updateCourse({ id: course.id, status: "active" })}
              isHidden={true}
              onDelete={async () => {
                if (
                  confirm(
                    `Are you sure you want to delete course "${course.name}"?`,
                  )
                ) {
                  await deleteCourse(course.id);
                }
              }}
              onEdit={() => setDialog({ type: "editCourse", course })}
            />
          ))}

        {/* Share Attendees App — at the end of the scrollable list */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none px-4 py-2"
          onClick={() => setDialog({ type: "share" })}
        >
          {/* Material "stay_primary_portrait" style phone icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#224866">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
          </svg>
          <span
            className="text-sm cursor-pointer"
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            Share Attendees' App...
          </span>
        </div>
      </div>

      {/* ---- Dialogs ---- */}
      <EditCourseDialog
        course={dialog.type === "editCourse" ? dialog.course : null}
        open={dialog.type === "editCourse"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "none" });
        }}
      />

      <NewCourseTypeDialog
        open={dialog.type === "courseType"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "none" });
        }}
        onSelectType={(type) => {
          setDialog({ type: "addCourse", courseType: type });
        }}
      />
      <AddCourseDialog
        open={dialog.type === "addCourse"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "none" });
        }}
        courseType={
          dialog.type === "addCourse" ? dialog.courseType : "CLASSROOM"
        }
      />
      <SendInstructionsDialog
        open={dialog.type === "share"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "none" });
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CourseListItem — 48px row with left color accent + Radix DropdownMenu
// ---------------------------------------------------------------------------

function CourseListItem({
  course,
  isActive,
  onSelect,
  onHide,
  onActivate,
  isHidden = false,
  onDelete,
  onEdit,
}: {
  course: Course;
  isActive: boolean;
  onSelect: () => void;
  onHide: () => void;
  onActivate: () => void;
  isHidden: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  // Green (#4caf50) for classroom, Blue (#1976d2) for field/shifts — matching legacy getCourseColor
  const courseColor = course.fieldCheckin ? "#1976d2" : "var(--color-success)";

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="flex w-full items-center text-left transition-colors duration-100 relative cursor-pointer h-16 hover:bg-[rgba(0,0,0,0.04)]"
        style={{
          backgroundColor: isActive ? "rgba(0,0,0,0.08)" : "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          paddingRight: 4,
        }}
      >
        {/* Color accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: courseColor }}
        />

        <div className="flex-1 pl-4 min-w-0">
          <p className="m-0 text-sm font-normal text-[rgba(0,0,0,0.87)] leading-[1.43] overflow-hidden text-ellipsis whitespace-nowrap">
            {course.name}
          </p>
          {course.internalid && (
            <p className="m-0 text-[11px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
              {course.internalid}
            </p>
          )}
        </div>

        {/* Self-contained dropdown menu — no state lifted to parent */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded-full hover:bg-black/10 transition-all p-1.5 text-[rgba(0,0,0,0.54)] cursor-pointer"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuItem
                className="flex items-center gap-4 px-4 py-3 text-[15px] text-[var(--color-text-main)] cursor-pointer"
                onSelect={() => onEdit()}
              >
                <Edit className="h-5 w-5 text-gray-500" /> Edit Course...
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-4 px-4 py-3 text-[15px] text-[var(--color-text-main)] cursor-pointer"
                onSelect={() => {
                  isHidden ? onActivate() : onHide();
                }}
              >
                {isHidden ? (
                  <><Eye className="h-5 w-5 text-gray-500" /> Make Active</>
                ) : (
                  <><BookOpen className="h-5 w-5 text-gray-500" /> Hide Course</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-4 px-4 py-3 text-[15px] text-[var(--color-text-main)] cursor-pointer"
                onSelect={() => onDelete()}
              >
                <Trash2 className="h-5 w-5 text-gray-500" /> Delete Course...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
