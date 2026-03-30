/**
 * ShiftTooltip — Hover tooltip for field checkin bars.
 * Shows shift duration, check-in/out times, location status, and selfie photos.
 * Matches the legacy app's two-column layout.
 */

import { format, differenceInMinutes } from "date-fns";
import { theme } from "@/config/theme";
import {
  getFieldCheckinStatus,
  getDistanceKm,
} from "../../utils/field-course.utils";
import type { StudentData } from "../../utils/field-course.utils";
import type { FieldCheckin, Course } from "@/shared/types";
import { useState } from "react";

interface ShiftTooltipProps {
  checkin: FieldCheckin;
  student: StudentData;
  course?: Course;
}

// ---------------------------------------------------------------------------
// Location helpers (reused from StudentFieldCheckinsView)
// ---------------------------------------------------------------------------
function getLocationText(
  location?: { latLng?: { lat: number; lng: number } },
  courseData?: Course,
): string {
  if (!location?.latLng) return "Undetected";
  if (!courseData?.location) return "Off site";
  const dist = getDistanceKm(
    location.latLng.lat,
    location.latLng.lng,
    courseData.location.lat,
    courseData.location.lng,
  );
  const radius = (courseData.location.radius || 200) / 1000;
  return dist <= radius ? "On site" : "Off site";
}

function LocationBadge({ text }: { text: string }) {
  const isOnSite = text === "On site";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isOnSite ? "#4caf50" : text === "Off site" ? "#f44336" : "#999",
        }}
      />
      {text}
    </span>
  );
}

export function ShiftTooltip({ checkin, student, course }: ShiftTooltipProps) {
  const [now] = useState(() => Date.now());

  const getTimeDiffStr = (start: number, end: number) => {
    const dif = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(dif / 60);
    const minutes = dif - hours * 60;
    return `${hours}:${minutes > 9 ? minutes : "0" + minutes}`;
  };

  const { status, color } = getFieldCheckinStatus(checkin);
  const locIn = getLocationText(checkin.checkInLocation, course);
  const locOut = getLocationText(checkin.checkOutLocation, course);

  return (
    <div
      style={{
        background: theme.colors.slider.bubble,
        color: theme.colors.text.white,
        padding: "12px 14px",
        borderRadius: 6,
        fontSize: 13,
        lineHeight: "20px",
        zIndex: 9999,
        width: 380,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header: Name + Duration */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: 10,
          borderBottom: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <div>
          <div style={{ fontWeight: theme.font.weight.semibold, fontSize: 14 }}>
            {student.name}
          </div>
          <div style={{ opacity: 0.85, fontSize: 12, marginTop: 2 }}>
            Shift duration:{" "}
            {checkin.checkedOutAt
              ? getTimeDiffStr(checkin.checkedInAt, checkin.checkedOutAt)
              : `${getTimeDiffStr(checkin.checkedInAt, now)} (in progress)`}
          </div>
        </div>
        {/* Status badge */}
        <div
          style={{
            fontSize: 11,
            color,
            fontWeight: theme.font.weight.semibold,
            marginTop: 2,
          }}
        >
          {status}
        </div>
      </div>

      {/* Late check-in request info */}
      {checkin.request && (
        <div
          style={{
            padding: "6px 0",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          <div>Late check-in request: {checkin.request}</div>
          {checkin.reason && <div>Reason: {checkin.reason}</div>}
        </div>
      )}

      {/* Two-column check-in / check-out */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 10,
        }}
      >
        {/* Check-in column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            <strong>Checked-in:</strong>{" "}
            {format(new Date(checkin.checkedInAt), "MMM d yyyy, HH:mm")}
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Location: </span>
            <LocationBadge text={locIn} />
          </div>
          {checkin.inSelfie && (
            <img
              src={checkin.inSelfie}
              alt="Check-in photo"
              style={{
                width: "100%",
                maxHeight: 140,
                objectFit: "cover",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          )}
        </div>

        {/* Check-out column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            <strong>Checked-out:</strong>{" "}
            {checkin.checkedOutAt
              ? format(new Date(checkin.checkedOutAt), "MMM d yyyy, HH:mm")
              : "In Progress..."}
          </div>
          {checkin.checkedOutAt && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Locations: </span>
              <LocationBadge text={locOut} />
            </div>
          )}
          {checkin.outSelfie && (
            <img
              src={checkin.outSelfie}
              alt="Check-out photo"
              style={{
                width: "100%",
                maxHeight: 140,
                objectFit: "cover",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
