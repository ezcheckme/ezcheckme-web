import { Users } from "lucide-react";
import type { StudentSessionStatus } from "../hooks/useSessionAttendeesStats";
import { SessionStudentRow } from "./SessionStudentRow";

export interface SessionStudentsTableProps {
  students: StudentSessionStatus[];
  isPremium: boolean;
  onStudentClick: (studentId: string) => void;
  onCheckinClick: (e: React.MouseEvent, student: StudentSessionStatus) => void;
  onSelfieClick: (e: React.MouseEvent, student: StudentSessionStatus) => void;
}

export function SessionStudentsTable({
  students,
  isPremium,
  onStudentClick,
  onCheckinClick,
  onSelfieClick,
}: SessionStudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center flex-1">
        <Users className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">No matching attendees</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "30%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "2%" }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
            <th className="px-4 py-2 text-left font-normal text-gray-600">
              Attendee
            </th>
            <th className="px-4 py-2 text-left font-normal text-gray-600">
              Check-in time
            </th>
            <th className="px-4 py-2 text-left font-normal text-gray-600">
              Check-in method
            </th>
            <th className="px-4 py-2 text-left font-normal text-gray-600">
              Location
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <SessionStudentRow
              key={student.id}
              student={student}
              isPremium={isPremium}
              onStudentClick={onStudentClick}
              onCheckinClick={onCheckinClick}
              onSelfieClick={onSelfieClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
