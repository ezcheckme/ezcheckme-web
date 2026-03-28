/**
 * FieldCourseStudents — Monthly shift calendar grid for field/shift courses.
 *
 * React 19 refactored:
 * - Shared components: SearchInput, MonthSlider
 * - Shared table styles from config/table-styles
 * - Theme tokens from config/theme
 * - Derived state via useMemo
 */

import { useState, useMemo, useEffect, startTransition } from "react";
import { format, isSameMonth, isSameDay } from "date-fns";
import { MoreVertical } from "lucide-react";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";
import { theme } from "@/config/theme";
import {
  FIXED_HEADER_STYLE,
  FIXED_CELL_STYLE,
  DATE_CELL_HEADER_STYLE,
  TABLE_STYLE,
} from "@/config/table-styles";
import { SearchInput } from "@/components/ui/search-input";
import { MonthSlider } from "@/components/ui/month-slider";
import {
  initFieldData,
  minutesToHourMinute,
  areDatesOnSameDay,
  isEndOfWeek,
  isEndOfMonth,
} from "../utils/field-course.utils";
import { StudentFieldCheckinsView } from "./field/StudentFieldCheckinsView";
import { DataCellComp } from "./field/DataCellComp";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseStudentsMenu } from "./CourseStudentsMenu";
import { AddStudentDialog } from "./AddStudentDialog";
import { DeleteStudentsDialog } from "./DeleteStudentsDialog";
import { ImportAttendeesDialog } from "./ImportAttendeesDialog";

// =========================================================================
// MAIN COMPONENT
// =========================================================================
export function FieldCourseStudents() {
  const courses = useCourseStore((s) => s.courses);
  const courseId = useCourseStore((s) => s.courseId);
  const checkins = useCourseStore((s) => s.checkins);
  const getCourseFieldCheckins = useCourseStore(
    (s) => s.getCourseFieldCheckins,
  );

  const course = courses?.find((c) => c.id === courseId);

  // Student detail drill-down
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Bulk action state
  const [selected, setSelected] = useState<string[]>([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [deleteStudentsOpen, setDeleteStudentsOpen] = useState(false);
  const [importAttendeesOpen, setImportAttendeesOpen] = useState(false);

  // Students from the student store
  const storeStudents = useStudentStore((s) => s.students);
  const studentsLoading = useStudentStore((s) => s.loading);
  const getStudents = useStudentStore((s) => s.getCourseStudents);

  // Load field checkins + students on courseId change
  useEffect(() => {
    if (courseId) {
      getCourseFieldCheckins(courseId);
      getStudents(courseId);
    }
  }, [courseId, getCourseFieldCheckins, getStudents]);

  // Map store students to the format initFieldData expects
  const students = useMemo(
    () =>
      storeStudents.map((s) => ({
        id: s.id,
        name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        firstName: s.firstName,
        lastName: s.lastName,
      })),
    [storeStudents],
  );

  // Derive all computed data via useMemo (React 19 pattern)
  const fieldData = useMemo(
    () => (students.length > 0 ? initFieldData(students, checkins) : null),
    [students, checkins],
  );

  const { months, studentsData, datesRow } = fieldData ?? {
    months: [] as Date[],
    studentsData: [],
    datesRow: [] as Date[],
  };

  // Auto-set currentMonth when fieldData changes
  const [prevFieldData, setPrevFieldData] = useState(fieldData);
  if (fieldData !== prevFieldData) {
    setPrevFieldData(fieldData);
    if (fieldData) setCurrentMonth(fieldData.currentMonth);
  }

  // Filter dates for current month
  const visibleDates = useMemo(
    () => datesRow.filter((d) => isSameMonth(d, currentMonth)),
    [datesRow, currentMonth],
  );

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsData;
    const term = searchTerm.toLowerCase();
    return studentsData.filter((s) => s.name.toLowerCase().includes(term));
  }, [studentsData, searchTerm]);

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(filteredStudents.map((s) => s.id));
    } else {
      setSelected([]);
    }
  }

  function handleItemChecked(
    e: React.ChangeEvent<HTMLInputElement>,
    studentId: string,
  ) {
    e.stopPropagation();
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  // --- Drill-down to student detail ---
  if (selectedStudentId) {
    const student = studentsData.find((s) => s.id === selectedStudentId);
    if (student && course) {
      return (
        <StudentFieldCheckinsView
          student={student}
          studentCheckins={student.checkins}
          course={course}
          onBack={() => setSelectedStudentId(null)}
        />
      );
    }
  }

  if (studentsLoading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          margin: theme.spacing.sm,
        }}
      >
        {/* Skeleton header */}
        <div
          style={{
            margin: "0 20px 4px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <Skeleton width={160} height={20} borderRadius={3} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Skeleton width={200} height={28} borderRadius={4} />
            <Skeleton width={160} height={28} borderRadius={4} />
          </div>
        </div>
        {/* Skeleton table */}
        <div className="flex-1 overflow-hidden m-4 space-y-3">
          <div className="flex gap-3 items-center">
            <Skeleton width={130} height={14} borderRadius={3} />
            <Skeleton width={60} height={14} borderRadius={3} />
            <Skeleton width={80} height={14} borderRadius={3} />
            <Skeleton width={90} height={14} borderRadius={3} />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} width={36} height={28} borderRadius={3} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 items-center"
              style={{ height: 48 }}
            >
              <Skeleton width={130} height={12} borderRadius={3} />
              <Skeleton width={48} height={12} borderRadius={3} />
              <Skeleton width={64} height={12} borderRadius={3} />
              <Skeleton width={72} height={12} borderRadius={3} />
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} width={36} height={20} borderRadius={3} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        margin: theme.spacing.sm,
      }}
    >
      {/* Header: Title + Month Slider + Search */}
      <div
        style={{
          margin: "0 20px 4px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            margin: theme.spacing.sm,
          }}
        >
          <span
            style={{
              fontWeight: theme.font.weight.medium,
              fontSize: "1.25rem",
              padding: 0,
              margin: 0,
            }}
          >
            Attendees{" "}
            {students.length > 0 && (
              <span
                style={{
                  fontWeight: theme.font.weight.normal,
                  color: theme.colors.text.hint,
                }}
              >
                ({students.length})
              </span>
            )}
          </span>
          <CourseStudentsMenu
            courseId={courseId || ""}
            selectedCount={selected.length}
            onAddStudent={() => setAddStudentOpen(true)}
            onDeleteSelected={() => setDeleteStudentsOpen(true)}
            onUploadList={() => setImportAttendeesOpen(true)}
          >
            <button
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                display: "flex",
                alignItems: "center",
              }}
              title="More options"
            >
              <MoreVertical size={18} color="#666" />
            </button>
          </CourseStudentsMenu>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: theme.spacing.lg,
          }}
        >
          <MonthSlider
            months={months}
            value={currentMonth}
            onChange={setCurrentMonth}
          />
          <SearchInput
            value={searchTerm}
            onChange={(v) => startTransition(() => setSearchTerm(v))}
          />
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto m-4">
        <table style={TABLE_STYLE}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              <th
                style={{
                  ...FIXED_HEADER_STYLE,
                  textAlign: "center",
                  width: 30,
                  padding: 0,
                  position: "sticky",
                  left: 0,
                  zIndex: 11,
                }}
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={
                    selected.length === filteredStudents.length &&
                    filteredStudents.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                style={{
                  ...FIXED_HEADER_STYLE,
                  textAlign: "center",
                  width: 70,
                  position: "sticky",
                  left: 30,
                  zIndex: 11,
                }}
              >
                Name
              </th>
              <th style={{ ...FIXED_HEADER_STYLE, width: 60 }}>Shifts</th>
              <th style={{ ...FIXED_HEADER_STYLE, width: 72 }}>
                Average Shift
              </th>
              <th style={{ ...FIXED_HEADER_STYLE, width: 72 }}>
                Total Duration
              </th>

              {visibleDates.map((date) => {
                const isToday = isSameDay(date, new Date());
                const endWeek = isEndOfWeek(date);
                const endMonth_ = isEndOfMonth(date);
                return (
                  <th
                    key={date.getTime()}
                    style={{
                      ...DATE_CELL_HEADER_STYLE,
                      background: isToday ? theme.colors.bg.today : "#f5f5f5",
                      color: "rgba(0, 0, 0, 0.87)",
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                      borderRight:
                        endMonth_ || endWeek
                          ? "2px #a6a6a6 solid"
                          : "1px grey solid",
                    }}
                  >
                    <div
                      style={{
                        fontSize: theme.font.size.sm,
                        minWidth: 28,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {format(date, "EEE")}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: theme.font.weight.bold,
                        }}
                      >
                        {format(date, "d")}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} style={{ cursor: "pointer", height: 48 }}>
                <td
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    ...FIXED_CELL_STYLE,
                    textAlign: "center",
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    width: 30,
                    padding: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selected.includes(student.id)}
                    onChange={(e) => handleItemChecked(e, student.id)}
                  />
                </td>
                <td
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{
                    ...FIXED_CELL_STYLE,
                    textAlign: "left",
                    position: "sticky",
                    left: 30,
                    zIndex: 5,
                  }}
                >
                  <div style={{ margin: "4px 0" }}>{student.name}</div>
                </td>

                <td
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{ ...FIXED_CELL_STYLE, textAlign: "center" }}
                >
                  <div style={{ margin: "4px 0" }}>
                    {student.checkins.length > 0
                      ? student.checkins.length
                      : "-"}
                  </div>
                </td>

                <td
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{ ...FIXED_CELL_STYLE, textAlign: "center" }}
                >
                  {student.checkins.length > 0
                    ? minutesToHourMinute(
                        student.totalShiftsDuration / student.checkins.length,
                        "hrs",
                        "min",
                      )
                    : "-"}
                </td>

                <td
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{ ...FIXED_CELL_STYLE, textAlign: "center" }}
                >
                  {minutesToHourMinute(
                    student.totalShiftsDuration,
                    "hrs",
                    "min",
                  )}
                </td>

                {visibleDates.map((date) => {
                  const dayCheckins = student.checkins.filter((c) =>
                    areDatesOnSameDay(c.checkedInAt, date),
                  );
                  const isToday = isSameDay(date, new Date());
                  const endWeek = isEndOfWeek(date);
                  const endMonth_ = isEndOfMonth(date);
                  return (
                    <DataCellComp
                      key={date.getTime()}
                      checkins={dayCheckins}
                      student={student}
                      isToday={isToday}
                      endWeek={endWeek}
                      endMonth={endMonth_}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: theme.spacing.xl,
              color: "#999",
              fontSize: theme.font.size.base,
            }}
          >
            {students.length === 0
              ? "No attendees in this course."
              : "No matching attendees."}
          </div>
        )}
      </div>

      {/* Pagination footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          fontSize: 13,
          color: "#666",
          borderTop: `1px solid #eee`,
        }}
      >
        <span>
          {filteredStudents.length > 0
            ? `1-${filteredStudents.length} of ${filteredStudents.length}`
            : ""}
        </span>
      </div>
      {/* Dialogs */}
      {courseId && (
        <>
          <AddStudentDialog
            open={addStudentOpen}
            onOpenChange={setAddStudentOpen}
            courseId={courseId}
          />
          <DeleteStudentsDialog
            open={deleteStudentsOpen}
            onOpenChange={setDeleteStudentsOpen}
            courseId={courseId}
            students={students.filter((s) => selected.includes(s.id))}
          />
          <ImportAttendeesDialog
            open={importAttendeesOpen}
            onOpenChange={setImportAttendeesOpen}
            courseId={courseId}
          />
        </>
      )}
    </div>
  );
}
