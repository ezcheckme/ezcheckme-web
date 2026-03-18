/**
 * ShiftTooltip — Hover tooltip for field checkin bars.
 * Shows shift duration, check-in/out times, and status.
 */

import { format, differenceInMinutes } from "date-fns";
import { theme } from "@/config/theme";
import { getFieldCheckinStatus } from "../../utils/field-course.utils";
import type { StudentData } from "../../utils/field-course.utils";
import type { FieldCheckin } from "@/shared/types";

interface ShiftTooltipProps {
  checkin: FieldCheckin;
  student: StudentData;
}

export function ShiftTooltip({ checkin, student }: ShiftTooltipProps) {
  const getTimeDiffStr = (start: number, end: number) => {
    const dif = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(dif / 60);
    const minutes = dif - hours * 60;
    return `${hours}:${minutes > 9 ? minutes : "0" + minutes}`;
  };

  const { status, color } = getFieldCheckinStatus(checkin);

  return (
    <div
      style={{
        background: theme.colors.slider.bubble,
        color: theme.colors.text.white,
        padding: "10px 14px",
        borderRadius: 6,
        fontSize: 13,
        lineHeight: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Title section — two-column layout matching legacy */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          margin: 5,
          width: 340,
          paddingBottom: 11,
          borderBottom: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ fontWeight: theme.font.weight.semibold }}>
            {student.name}
          </div>
          <div>
            Shift duration:{" "}
            {checkin.checkedOutAt
              ? getTimeDiffStr(checkin.checkedInAt, checkin.checkedOutAt)
              : `${getTimeDiffStr(checkin.checkedInAt, Date.now())} (in progress)`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            justifyContent: "flex-start",
          }}
        >
          {checkin.request && (
            <>
              <div>Late check-in request: {checkin.request}</div>
              {checkin.reason && <div>Reason: {checkin.reason}</div>}
            </>
          )}
        </div>
      </div>
      {/* Check-in / Check-out details — side by side */}
      <div style={{ display: "flex", flexDirection: "row", marginTop: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", margin: 5 }}>
          <div>
            Checked-in:{" "}
            {format(new Date(checkin.checkedInAt), "MMM d yyyy, HH:mm")}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", margin: 5 }}>
          <div>
            Checked-out:{" "}
            {checkin.checkedOutAt
              ? format(new Date(checkin.checkedOutAt), "MMM d yyyy, HH:mm")
              : "Shift in Progress..."}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4, margin: 5, color }}>{status}</div>
    </div>
  );
}
