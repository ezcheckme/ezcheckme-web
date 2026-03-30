import type { Student } from "@/shared/types";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export interface CourseStudentRowProps {
  student: Student;
  sessionsCopy: any[];
  isSelected: boolean;
  isPremium: boolean;
  showAttendeesPhoneAndId?: boolean;
  onSelect: (studentId: string) => void;
  onStudentClick: (studentId: string) => void;
  onIconClick: (e: React.MouseEvent, student: Student, session: any) => void;
  onPricingClick: (e: React.MouseEvent) => void;
}

export function CourseStudentRow({
  student,
  sessionsCopy,
  isSelected,
  isPremium,
  showAttendeesPhoneAndId,
  onSelect,
  onStudentClick,
  onIconClick,
  onPricingClick,
}: CourseStudentRowProps) {
  // Parse name into first/last
  const firstName =
    student.firstName ||
    (student.name
      ? student.name.split(" ").slice(0, -1).join(" ")
      : "");
  const lastName =
    student.lastName ||
    (student.name ? student.name.split(" ").pop() : "Unknown");

  // Calculate attendance rate from sessions
  const studentSessions = student.sessions || {};
  const attendedCount = sessionsCopy.filter((s) => {
    const entry = studentSessions[s.id];
    return (
      entry &&
      entry.request !== "pending" &&
      entry.request !== "denied"
    );
  }).length;
  
  const rate =
    sessionsCopy.length > 0
      ? Math.round((attendedCount / sessionsCopy.length) * 100)
      : 0;

  return (
    <tr
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      style={{
        height: 36,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Checkbox */}
      <td
        className="px-2 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="rounded border-gray-300"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
        />
      </td>
      {/* Last Name with avatar */}
      <td
        className="px-3"
        onClick={() => onStudentClick(student.id)}
      >
        <div className="flex items-center gap-1.5">
          <img
            src={
              student.picture ||
              "/assets/images/icons/profile.jpg"
            }
            alt=""
            className="h-7 w-7 rounded-full object-cover shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/icons/profile.jpg";
            }}
          />
          <span className="text-gray-700 truncate">
            {lastName}
          </span>
        </div>
      </td>
      {/* First Name */}
      <td
        className="px-3 text-gray-700 truncate"
        style={{ maxWidth: 190 }}
        onClick={() => onStudentClick(student.id)}
      >
        {firstName}
      </td>
      {/* Optional Phone/ID view */}
      {showAttendeesPhoneAndId && (
        <>
          <td
            className="px-3 text-gray-700 truncate"
            style={{ maxWidth: 190 }}
            onClick={() => onStudentClick(student.id)}
          >
            {student.phone || ""}
          </td>
          <td
            className="px-3 text-gray-700 truncate"
            style={{ maxWidth: 190 }}
            onClick={() => onStudentClick(student.id)}
          >
            {student.attendeeid || ""}
          </td>
        </>
      )}
      {/* Attendance Rate */}
      <td
        className="px-3 text-center font-medium text-gray-600"
        onClick={(e) => {
          if (!isPremium) {
            onPricingClick(e);
          } else {
            onStudentClick(student.id);
          }
        }}
        style={!isPremium ? { filter: "blur(5px)", userSelect: "none" } : undefined}
      >
        {!isPremium ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>XX%</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Premium account required. Click for details...</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          `${rate}%`
        )}
      </td>
      {/* Per-session green/red circle icons — matching legacy */}
      {sessionsCopy.map((session) => {
        const entry = studentSessions[session.id];
        const attended =
          entry &&
          entry.request !== "pending" &&
          entry.request !== "denied";
        return (
          <td
            key={session.id}
            className="px-1 text-center"
            style={{ minWidth: 32 }}
            onClick={(e) => onIconClick(e, student, session)}
            title={`Click to ${attended ? "uncheck" : "check-in"} ${student.name}`}
          >
            {attended ? (
              /* Green circle with checkmark — legacy style */
              <svg className="h-5 w-5 mx-auto cursor-pointer" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#4caf50" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              /* Red circle with X — legacy style */
              <svg className="h-5 w-5 mx-auto cursor-pointer" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#f44336" />
                <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </td>
        );
      })}
    </tr>
  );
}
