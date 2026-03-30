import type { Student } from "@/shared/types";
interface StudentAttendanceSummaryProps {
  student: Student;
  attendanceRate: number;
  currentCourseName: string;
  onEdit: () => void;
}

export function StudentAttendanceSummary({
  student,
  attendanceRate,
  currentCourseName,
  onEdit,
}: StudentAttendanceSummaryProps) {

  // Mask phone number like legacy: *****1234
  function maskPhone(phone: string | undefined) {
    if (!phone) return "not provided";
    if (phone.length <= 4) return phone;
    return "*******" + phone.slice(-4);
  }

  // Mask student ID like legacy
  function maskId(id: string | undefined) {
    if (!id) return "not provided";
    return id;
  }

  return (
    <div className="flex px-6 py-4 gap-6">
      {/* Left: Avatar with attendance % overlay + Edit button */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <img
            width={78}
            height={78}
            className="rounded-none object-cover"
            style={{ border: "1px solid #dddddd", width: 78, height: 78 }}
            src={student.picture || "/assets/images/icons/profile.jpg"}
            alt="avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/icons/profile.jpg";
            }}
          />
          {/* Attendance % badge overlay — donut style */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center bg-white rounded-full"
            style={{
              width: 44,
              height: 44,
            }}
          >
            <svg viewBox="0 0 44 44" className="h-11 w-11">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="white"
                stroke="#e0e0e0"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#4caf50"
                strokeWidth="3"
                strokeDasharray={`${(attendanceRate / 100) * 113.1} 113.1`}
                strokeDashoffset="0"
                transform="rotate(-90 22 22)"
                strokeLinecap="round"
              />
              <text
                x="22"
                y="22"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#333"
                fontSize="11"
                fontWeight="500"
              >
                {attendanceRate}%
              </text>
            </svg>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="mt-5 px-6 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Right: Student details */}
      <div className="flex flex-col gap-1 py-1">
        <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.87)]">
          {student.name}
          {student.attendee_manual ? " (added manually)" : ""}
        </h2>
        <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
          Email:{" "}
          {student.email ? (
            <a
              href={`mailto:${student.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              {student.email}
            </a>
          ) : (
            "not provided"
          )}
        </p>
        <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
          Phone: {maskPhone(student.phone)}
        </p>
        <p className="text-[14px] text-[rgba(0,0,0,0.54)] py-1">
          ID: {maskId(student.studentId || student.attendeeid)}
        </p>
        <div className="flex items-center mt-3 text-[14px] text-[rgba(0,0,0,0.87)]">
          <dt className="text-gray-500 font-medium">Course</dt>
          <dd className="col-span-2 text-gray-900 font-medium text-right sm:text-left ml-2">
            {currentCourseName}
          </dd>
        </div>
      </div>
    </div>
  );
}
