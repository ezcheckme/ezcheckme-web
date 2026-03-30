import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { XVIcon } from "./XVIcon";
import { formatCheckInMethod, getLocationLabel } from "../utils/attendance.utils";
import type { StudentSessionStatus } from "../hooks/useSessionAttendeesStats";

export interface SessionStudentRowProps {
  student: StudentSessionStatus;
  isPremium: boolean;
  onStudentClick: (studentId: string) => void;
  onCheckinClick: (e: React.MouseEvent, student: StudentSessionStatus) => void;
  onSelfieClick: (e: React.MouseEvent, student: StudentSessionStatus) => void;
}

export function SessionStudentRow({
  student,
  isPremium,
  onStudentClick,
  onCheckinClick,
  onSelfieClick,
}: SessionStudentRowProps) {
  const isCheckedIn = student.checkedIn;
  const methodText = formatCheckInMethod(student.checkinMethod);
  const locStatus = student.locationStatus;
  const locText = getLocationLabel(locStatus);
  const locColor =
    locStatus === "verified"
      ? "text-green-600"
      : locStatus === "remote"
      ? "text-red-500"
      : "text-gray-400";

  return (
    <tr
      onClick={() => onStudentClick(student.id)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      style={{
        height: 48,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <td className="px-4">
        <div className="flex items-center gap-2">
          <img
            width={40}
            height={40}
            className="shrink-0 object-cover"
            style={{ borderRadius: 2 }}
            src={student.picture || "/assets/images/icons/profile.jpg"}
            alt="avatar"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.endsWith("/assets/images/icons/profile.jpg")) {
                img.src = "/assets/images/icons/profile.jpg";
              }
            }}
          />
          <span className="text-gray-800">{student.name}</span>
        </div>
      </td>

      <td className="px-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onCheckinClick(e, student);
          }}
        >
          <XVIcon checked={isCheckedIn} request={student.request} />
          {isCheckedIn ? (
            <span className="text-gray-700">
              {student.checkinTime
                ? new Date(student.checkinTime).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "—"}
            </span>
          ) : (
            <span className="text-blue-600 underline hover:text-blue-800 text-sm">
              Check-in...
            </span>
          )}
        </div>
      </td>

      <td className="px-4">
        {student.request ? (
          <div
            className="text-orange-600 font-medium cursor-help"
            title={student.checkinReason ? `Reason: ${student.checkinReason}` : "Late check-in request"}
          >
            {student.request.charAt(0).toUpperCase() + student.request.slice(1)} late check-in
          </div>
        ) : isCheckedIn && methodText ? (
          <span
            className={cn(
              "text-gray-700",
              student.checkinSelfie ? "underline cursor-pointer hover:text-blue-600" : ""
            )}
            onClick={(e) => {
              if (student.checkinSelfie) {
                e.stopPropagation();
                onSelfieClick(e, student);
              }
            }}
          >
            {methodText}
          </span>
        ) : null}
      </td>

      <td className="px-4">
        {isCheckedIn ? (
          isPremium ? (
            locStatus !== "undetected" ? (
              <span
                className={cn("inline-flex items-center gap-1", locColor)}
                title={locStatus === "verified" ? "Location check verified" : "Location check failed / beyond limit"}
              >
                <MapPin className="h-4 w-4" />
                <span>{locText}</span>
              </span>
            ) : null
          ) : (
            <span className="text-gray-400 font-medium">N/A</span>
          )
        ) : null}
      </td>
      <td />
    </tr>
  );
}
