/**
 * FieldCheckinBar — The green/orange/red shift bar in the calendar grid.
 * Renders a positioned bar with hover tooltip.
 */

import { useState, useRef } from "react";
import { ShiftTooltip } from "./ShiftTooltip";
import { theme } from "@/config/theme";
import type { StudentData } from "../../utils/field-course.utils";
import type { FieldCheckin } from "@/shared/types";

interface FieldCheckinBarProps {
  checkin: FieldCheckin;
  student: StudentData;
  cellWidth: number;
  cellHeight: number;
}

const BAR_MIN_WIDTH = 4;

function getBarColor(checkin: FieldCheckin): string {
  if (checkin.request === "denied") return theme.colors.field.denied;
  if (checkin.request === "pending") return theme.colors.field.pending;
  if (!checkin.checkedOutAt) return theme.colors.field.openShift;
  return theme.colors.field.ok;
}

function getHoverColor(checkin: FieldCheckin): string {
  if (checkin.request === "pending") return theme.colors.field.pendingHover;
  if (checkin.request === "denied") return theme.colors.field.deniedHover;
  return theme.colors.field.okHover;
}

export function FieldCheckinBar({
  checkin,
  student,
  cellWidth,
  cellHeight,
}: FieldCheckinBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [now] = useState(() => Date.now());

  const width = (() => {
    const end = checkin.checkedOutAt ?? now;
    const w = (cellWidth * (end - checkin.checkedInAt)) / 86400000;
    return Math.max(w, BAR_MIN_WIDTH);
  })();

  const left = (() => {
    const startTime = new Date(checkin.checkedInAt);
    const minutesPassed = startTime.getHours() * 60 + startTime.getMinutes();
    return (cellWidth * minutesPassed) / 24 / 60;
  })();

  const color = getBarColor(checkin);
  const hover = getHoverColor(checkin);

  return (
    <div
      ref={barRef}
      onMouseEnter={() => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        enterTimerRef.current = setTimeout(() => setShowTooltip(true), 300);
      }}
      onMouseLeave={() => {
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        leaveTimerRef.current = setTimeout(() => setShowTooltip(false), 300);
      }}
      style={{
        position: "absolute",
        zIndex: 10,
        height: Math.max(cellHeight - 9, 0),
        width,
        background: color,
        left,
        top: 4,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseOver={(e) =>
        ((e.currentTarget as HTMLElement).style.background = hover)
      }
      onMouseOut={(e) =>
        ((e.currentTarget as HTMLElement).style.background = color)
      }
    >
      {showTooltip && barRef.current && (
        <div
          style={{
            position: "fixed",
            zIndex: 10000,
            top: (() => {
              const rect = barRef.current!.getBoundingClientRect();
              const isUpperHalf = rect.top < window.innerHeight * 0.5;
              // left-start: align top of tooltip with top of bar
              // left-end: tooltip appears above the bar
              return isUpperHalf ? rect.top : rect.bottom - 8;
            })(),
            left: barRef.current.getBoundingClientRect().left - 370,
            pointerEvents: "none",
          }}
        >
          <ShiftTooltip checkin={checkin} student={student} />
        </div>
      )}
    </div>
  );
}
