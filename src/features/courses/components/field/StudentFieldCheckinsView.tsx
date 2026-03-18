/**
 * StudentFieldCheckinsView — Drill-down detail view for a single student's shifts.
 * Shows check-in/out times, duration, location, and status in a table.
 */

import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { theme } from "@/config/theme";
import {
  minutesToHourMinute,
  getFieldCheckinStatus,
  getDistanceKm,
} from "../../utils/field-course.utils";
import type { StudentData } from "../../utils/field-course.utils";
import type { FieldCheckin, Course } from "@/shared/types";

interface StudentFieldCheckinsViewProps {
  student: StudentData;
  studentCheckins: FieldCheckin[];
  course: Course;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Location helpers
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

function getLocationColor(text: string): string {
  if (text === "On site") return theme.colors.location.onSite;
  if (text === "Off site") return theme.colors.location.offSite;
  return theme.colors.location.undetected;
}

function getLocationIcon(text: string): string {
  if (text === "On site") return "📍";
  if (text === "Off site") return "📌";
  return "📍";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StudentFieldCheckinsView({
  student,
  studentCheckins,
  course,
  onBack,
}: StudentFieldCheckinsViewProps) {
  const sorted = [...studentCheckins].sort(
    (a, b) => a.checkedInAt - b.checkedInAt,
  );

  return (
    <div style={{ padding: "16px 20px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: theme.colors.accent,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: theme.font.size.base,
          marginBottom: 12,
        }}
      >
        <ArrowLeft size={16} /> All Attendees
      </button>

      {/* Student profile header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "#666",
          }}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{student.name}</div>
        </div>
      </div>

      {/* Checkins table */}
      {sorted.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: theme.font.size.base,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.colors.border.medium}` }}>
              {[
                "Check-in",
                "Check-out",
                "Shift Duration",
                "Location In",
                "Location Out",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    fontWeight: 600,
                    color: theme.colors.slider.bubble,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((checkin) => {
              const { status, color } = getFieldCheckinStatus(checkin);
              const locIn = getLocationText(checkin.checkInLocation, course);
              const locOut = getLocationText(checkin.checkOutLocation, course);
              return (
                <tr
                  key={checkin._id}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    {format(
                      new Date(checkin.checkedInAt),
                      "MMM dd yyyy, HH:mm",
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {checkin.checkedOutAt
                      ? format(
                          new Date(checkin.checkedOutAt),
                          "MMM dd yyyy, HH:mm",
                        )
                      : ""}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {minutesToHourMinute(checkin.duration || 0)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: getLocationColor(locIn) }}>
                      {getLocationIcon(locIn)} {locIn}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: getLocationColor(locOut) }}>
                      {getLocationIcon(locOut)} {locOut}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color }}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#999", padding: 20 }}>
          No shifts recorded for this attendee.
        </div>
      )}
    </div>
  );
}
