import { useState, useMemo, startTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { useAdminStore } from "../../store/admin.store";
import { format } from "date-fns";
import { exportBasicTableToExcel } from "@/shared/utils/export.utils";

export function HostsAdminTable() {
  const { t } = useTranslation();
  const { hostsStats, loading } = useAdminStore();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [minCourses, setMinCourses] = useState<number | "">("");
  const [minSessions, setMinSessions] = useState<number | "">(1);
  const [minAttendees, setMinAttendees] = useState<number | "">(1);
  const [minCheckins, setMinCheckins] = useState<number | "">(1);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const data = Array.isArray(hostsStats) ? hostsStats : [];

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      if (
        searchTerm &&
        !item.hostName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (minCourses !== "" && (item.courses || 0) < minCourses)
        return false;
      if (minSessions !== "" && (item.sessions || 0) < minSessions)
        return false;
      if (minAttendees !== "" && (item.activeAttendees || 0) < minAttendees)
        return false;
      if (minCheckins !== "" && (item.checkins || 0) < minCheckins)
        return false;
      return true;
    });
  }, [data, searchTerm, minCourses, minSessions, minAttendees, minCheckins]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        let aVal = a[sortConfig.key] || 0;
        let bVal = b[sortConfig.key] || 0;

        if (sortConfig.key === "hostName") {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleExportExcel = async () => {
    if (sortedData.length === 0) return;

    const exportData = sortedData.map((row: any, i: number) => [
      i + 1,
      Array.isArray(row.hostName) ? row.hostName[0] : row.hostName,
      `${Math.round((row.rate || 0) * 100)}%`,
      row.courses || 0,
      row.sessions || 0,
      row.activeAttendees || 0,
      row.checkins || 0,
    ]);

    exportData.unshift([
      "#",
      t("Instructor"),
      t("Attendance (%)"),
      t("Courses"),
      t("Sessions"),
      t("Unique Attendees"),
      t("Check-ins"),
    ]);

    exportBasicTableToExcel({
      fileName: `Report_Instructors_${format(new Date(), "yyyy-MM-dd")}`,
      sheetName: "Report",
      data: exportData,
      columnWidths: [10, 20, 20, 20, 20, 20, 20],
    });
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 p-8 flex justify-center w-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-300 bg-[#f5f5f5] text-gray-800 font-semibold">
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100/50 w-16">
                #
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-gray-100/50"
                onClick={() => requestSort("hostName")}
              >
                {t("Instructor")}{" "}
                {sortConfig?.key === "hostName"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
                onClick={() => requestSort("rate")}
              >
                {t("Attendance (%)")}{" "}
                {sortConfig?.key === "rate"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
                onClick={() => requestSort("courses")}
              >
                {t("Courses")}{" "}
                {sortConfig?.key === "courses"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-gray-100/50"
                onClick={() => requestSort("sessions")}
              >
                {t("Sessions")}{" "}
                {sortConfig?.key === "sessions"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
                onClick={() => requestSort("activeAttendees")}
              >
                {t("Unique Attendees")}{" "}
                {sortConfig?.key === "activeAttendees"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-gray-100/50"
                onClick={() => requestSort("checkins")}
              >
                {t("Check-ins")}{" "}
                {sortConfig?.key === "checkins"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th className="px-6 py-2 text-right">
                <div className="flex items-center justify-end gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => {
                        startTransition(() => setSearchTerm(e.target.value));
                        setPage(0);
                      }}
                      className="border-b border-gray-300 bg-transparent py-1 px-2 text-sm focus:outline-none focus:border-blue-500 w-32 md:w-48 placeholder:text-gray-400 font-normal"
                    />
                    <Search className="absolute right-2 top-1.5 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={handleExportExcel}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Export to XLS"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {t("No instructors found")}
                </td>
              </tr>
            ) : (
              paginatedData.map((host, idx) => (
                <tr
                  key={host.hostId}
                  className="hover:bg-[#e9e9e9] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3 text-gray-500">
                    {page * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {Array.isArray(host.hostName) ? host.hostName[0] : host.hostName}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${(host.rate || 0) >= 0.8 ? "bg-green-100 text-green-700" : (host.rate || 0) >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                    >
                      {Math.round((host.rate || 0) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {(host.courses || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {(host.sessions || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {(host.activeAttendees || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {(host.checkins || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border-t border-gray-200 gap-4">
        {/* Filters */}
        <div className="flex items-end gap-4 text-sm">
          <span className="text-gray-600 mb-1.5 font-medium">Filter by:</span>
          {/* Min courses */}
          <div className="flex flex-col w-20">
            <span className="text-[10px] text-gray-400 capitalize mb-0.5">
              Min courses
            </span>
            <input
              type="number"
              min="0"
              value={minCourses}
              onChange={(e) => {
                setMinCourses(
                  e.target.value ? parseInt(e.target.value, 10) : "",
                );
                setPage(0);
              }}
              className="border-b border-gray-300 py-1 px-1 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800"
            />
          </div>
          {/* Min sessions */}
          <div className="flex flex-col w-20">
            <span className="text-[10px] text-gray-400 capitalize mb-0.5">
              Min sessions
            </span>
            <input
              type="number"
              min="0"
              value={minSessions}
              onChange={(e) => {
                setMinSessions(
                  e.target.value ? parseInt(e.target.value, 10) : "",
                );
                setPage(0);
              }}
              className="border-b border-gray-300 py-1 px-1 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800"
            />
          </div>
          {/* Min attendees */}
          <div className="flex flex-col w-20">
            <span className="text-[10px] text-gray-400 capitalize mb-0.5">
              Min attendees
            </span>
            <input
              type="number"
              min="0"
              value={minAttendees}
              onChange={(e) => {
                setMinAttendees(
                  e.target.value ? parseInt(e.target.value, 10) : "",
                );
                setPage(0);
              }}
              className="border-b border-gray-300 py-1 px-1 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800"
            />
          </div>
          {/* Min check-ins */}
          <div className="flex flex-col w-24">
            <span className="text-[10px] text-gray-400 capitalize mb-0.5">
              Min check-ins
            </span>
            <input
              type="number"
              min="0"
              value={minCheckins}
              onChange={(e) => {
                setMinCheckins(
                  e.target.value ? parseInt(e.target.value, 10) : "",
                );
                setPage(0);
              }}
              className="border-b border-gray-300 py-1 px-1 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800"
            />
          </div>

          <span className="text-gray-500 text-xs ml-4 mb-2">
            Showing {sortedData.length} out of {data.length}
          </span>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="bg-transparent text-gray-700 outline-none cursor-pointer p-1 rounded hover:bg-gray-100"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {sortedData.length === 0 ? 0 : page * rowsPerPage + 1}-
              {Math.min((page + 1) * rowsPerPage, sortedData.length)} of{" "}
              {sortedData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || totalPages === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
