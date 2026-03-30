import type { Session, Student } from "@/shared/types";

interface StudentSessionHistoryTableProps {
  student: Student;
  paginatedSessions: Session[];
  onToggleCheckin: (session: Session) => Promise<void>;
  isCheckedIn: (session: Session) => NonNullable<Student["sessions"]>[string] | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  startItem: number;
  endItem: number;
  totalItems: number;
  totalPages: number;
}

export function StudentSessionHistoryTable({
  paginatedSessions,
  onToggleCheckin,
  isCheckedIn,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  startItem,
  endItem,
  totalItems,
  totalPages,
}: StudentSessionHistoryTableProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Sessions table — matching legacy columns */}
      <div className="overflow-x-auto flex-1 h-[0px]">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
              <th
                className="px-3 py-2 text-left font-normal text-sm text-[#000000] sticky top-0 bg-white"
                style={{ paddingLeft: 16 }}
              >
                Session name
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500 sticky top-0 bg-white">
                Date & Time
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500 sticky top-0 bg-white">
                Session ID
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500 sticky top-0 bg-white">
                Check-in
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500 sticky top-0 bg-white">
                Check-in method
              </th>
              <th className="px-3 py-2 text-left font-normal text-sm text-gray-500 sticky top-0 bg-white">
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSessions.map((session) => {
              const checkinEntry = isCheckedIn(session);
              const attended = !!checkinEntry;
              const checkinTime = checkinEntry?.time
                ? new Date(checkinEntry.time).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : null;
              const checkinMethod = checkinEntry?.method || "";
              const location = checkinEntry?.location;

              return (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{
                    height: 44,
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <td className="px-3 text-gray-800" style={{ paddingLeft: 16 }}>
                    <div className="font-medium whitespace-nowrap">
                      {session.name || `Session ${session.serialId ?? ""}`}
                    </div>
                    {session.description && (
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">
                        {session.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 text-gray-600 whitespace-nowrap">
                    {session.begins
                      ? new Date(session.begins)
                          .toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(",", "")
                      : "—"}
                  </td>
                  <td className="px-3 text-gray-600">
                    {session.shortid || session.id?.slice(0, 6) || "—"}
                  </td>
                  <td className="px-3">
                    {attended ? (
                      <span className="flex items-center gap-1 text-[#4caf50]">
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#4caf50" />
                          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs text-gray-600 whitespace-nowrap">{checkinTime}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onToggleCheckin(session)}
                        className="flex items-center gap-1 text-[#f44336] hover:text-[#d32f2f] transition-colors"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#f44336" />
                          <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs underline whitespace-nowrap">Check-in...</span>
                      </button>
                    )}
                  </td>
                  <td className="px-3 text-gray-600 text-xs">
                    {attended ? (checkinMethod || "—") : ""}
                  </td>
                  <td className="px-3 text-gray-600 text-xs">
                    {attended
                      ? location
                        ? `📍 ${typeof location === "object" ? "Set" : location}`
                        : "N/A"
                      : ""}
                  </td>
                </tr>
              );
            })}
            
            {paginatedSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  No sessions found for this course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Previous/Next Attendee links + pagination */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t mt-auto"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`text-xs flex items-center gap-1 ${
              hasPrev
                ? "text-link hover:underline font-medium cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            ◀ Previous Attendee
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`text-xs flex items-center gap-1 ${
              hasNext
                ? "text-link hover:underline font-medium cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Next Attendee ▶
          </button>
        </div>

        {totalItems > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Rows per Page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="border-none bg-transparent text-xs text-gray-600 cursor-pointer focus:outline-none"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {startItem}-{endItem} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p: number) => Math.max(0, p - 1))}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p: number) => Math.min(totalPages - 1, p + 1))}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
