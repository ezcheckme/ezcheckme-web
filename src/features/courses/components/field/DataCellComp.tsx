/**
 * DataCellComp — Renders shift bars for a single day/student cell in the calendar grid.
 */

import { useState, useEffect, useRef } from "react";
import { FieldCheckinBar } from "./FieldCheckinBar";
import { areDatesOnSameDay } from "../../utils/field-course.utils";
import type { StudentData } from "../../utils/field-course.utils";
import type { FieldCheckin, Course } from "@/shared/types";

interface DataCellProps {
  checkins: FieldCheckin[];
  student: StudentData;
  isToday: boolean;
  endWeek: boolean;
  endMonth: boolean;
  course?: Course;
}

export function DataCellComp({
  checkins,
  student,
  isToday,
  endWeek,
  endMonth,
  course,
}: DataCellProps) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <td
      ref={cellRef}
      style={{
        padding: 0,
        position: "relative",
        verticalAlign: "top",
        border: "1px grey solid",
        textAlign: "center",
        background: isToday ? "#e9e9e9" : "transparent",
        borderRight:
          endMonth || endWeek ? "2px #a6a6a6 solid" : "1px grey solid",
        minWidth: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {checkins.length === 0 ? (
          <div>&nbsp;</div>
        ) : (
          checkins.map((checkin, idx) => (
            <div
              key={checkin._id || `checkin-${idx}`}
              style={{
                margin: "4px 0",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <FieldCheckinBar
                checkin={checkin}
                student={student}
                cellWidth={dims.w}
                cellHeight={dims.h}
                course={course}
              />
            </div>
          ))
        )}
      </div>
    </td>
  );
}

// Re-export areDatesOnSameDay for the parent to use when filtering
export { areDatesOnSameDay };
