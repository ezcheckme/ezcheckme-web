import { useTranslation } from "react-i18next";
import { useAdminStore } from "../store/admin.store";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";

export function AdminFieldStatsTable() {
  const { t } = useTranslation();
  const { adminStats, loading, selectedGraphItems, toggleGraphItem } =
    useAdminStore();

  const fieldData = adminStats?.field || [];
  const generalData = adminStats?.general || {};

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [minCourses, setMinCourses] = useState<number | "">("");
  const [minSessions, setMinSessions] = useState<number | "">("");
  const [minAttendees, setMinAttendees] = useState<number | "">("");
  const [minCheckins, setMinCheckins] = useState<number | "">("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

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
    return fieldData.filter((a) => {
      if (minCourses !== "" && (a.courses?.length || 0) < minCourses)
        return false;
      if (minSessions !== "" && (a.sessions || 0) < minSessions) return false;
      if (minAttendees !== "" && (a.activeAttendees || 0) < minAttendees)
        return false;
      if (minCheckins !== "" && (a.checkins || 0) < minCheckins) return false;
      return true;
    });
  }, [fieldData, minCourses, minSessions, minAttendees, minCheckins]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        switch (sortConfig.key) {
          case "name":
            aVal = a.faculty?.name || "";
            bVal = b.faculty?.name || "";
            break;
          case "rate":
            aVal = Math.floor((a.rate || 0) * 1000) / 10;
            bVal = Math.floor((b.rate || 0) * 1000) / 10;
            break;
          case "courses":
            aVal = a.courses?.length || 0;
            bVal = b.courses?.length || 0;
            break;
          default:
            aVal = (a as unknown as Record<string, string | number>)[sortConfig.key] || 0;
            bVal = (b as unknown as Record<string, string | number>)[sortConfig.key] || 0;
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
    const ExcelJS = (await import("exceljs")).default;
    const fileSaver = await import("file-saver");
    const saveAs = fileSaver.saveAs || fileSaver.default;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    sheet.addRow([
      t("Academic Unit"),
      t("Attendance Rate"),
      t("Courses"),
      t("Sessions"),
      t("Unique Attendees"),
      t("Check-ins"),
    ]);

    const len = fieldData.length || 1;
    sheet.addRow([
      "Average",
      generalData.avgAttendanceRate !== undefined
        ? Math.floor(generalData.avgAttendanceRate * 1000) / 10 + "%"
        : "",
      Math.round((generalData.courses || 0) / len),
      Math.round((generalData.sessions || 0) / len),
      Math.round(
        fieldData.reduce(
          (acc: number, r) => acc + (r.activeAttendees || 0),
          0,
        ) / len,
      ),
      Math.round((generalData.checkins || 0) / len),
    ]);

    sortedData.forEach((row, i: number) => {
      sheet.addRow([
        i + 1,
        row.faculty?.name || "Unknown",
        `${Math.floor((row.rate || 0) * 1000) / 10}%`,
        row.courses?.length || 0,
        row.sessions || 0,
        row.activeAttendees || 0,
        row.checkins || 0,
      ]);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" },
      bgColor: { argb: "FFF2F2F2" },
    };
    sheet.columns.forEach((col) => {
      if (col) col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 overflow-hidden">
        <div className="h-[400px] animate-pulse bg-gray-50 flex flex-col">
          <div className="h-12 bg-gray-200 border-b border-gray-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 mt-2 mx-4 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!fieldData.length && !loading) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_0_1px_0_rgba(0,0,0,0.24)] border border-black/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-300 bg-[#f5f5f5] text-gray-800 font-semibold">
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 cursor-pointer"
                  checked={
                    selectedGraphItems.includes("all") &&
                    fieldData.every((r) =>
                      selectedGraphItems.includes(
                        r.faculty?._id || r.faculty?.id || "",
                      ),
                    )
                  }
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    toggleGraphItem("all", true);
                    // Also toggle all rows if "all" is clicked (optional behavior, but typical)
                    if (isChecked) {
                      fieldData.forEach((r) => {
                        const id = r.faculty?._id || r.faculty?.id;
                        if (id && !selectedGraphItems.includes(id))
                          toggleGraphItem(id);
                      });
                    } else {
                      fieldData.forEach((r) => {
                        const id = r.faculty?._id || r.faculty?.id;
                        if (id && selectedGraphItems.includes(id))
                          toggleGraphItem(id);
                      });
                    }
                  }}
                />
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
                onClick={() => requestSort("name")}
              >
                {t("Academic Unit")}{" "}
                {sortConfig?.key === "name"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
                onClick={() => requestSort("rate")}
              >
                {t("Attendance Rate")}{" "}
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
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
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
                className="px-6 py-4 cursor-pointer hover:bg-[#ebebeb]"
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
            {/* Overall Row */}
            <tr className="bg-gray-50/60 font-medium text-gray-900">
              <td className="px-6 py-3 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={selectedGraphItems.includes("all")}
                  onChange={() => toggleGraphItem("all", true)}
                />
              </td>
              <td className="px-6 py-3">Average</td>
              <td className="px-6 py-3">
                {generalData.avgAttendanceRate !== undefined
                  ? Math.floor(generalData.avgAttendanceRate * 1000) / 10 + "%"
                  : ""}
              </td>
              <td className="px-6 py-3">
                {Math.round(
                  (generalData.courses || 0) / (fieldData.length || 1),
                )}
              </td>
              <td className="px-6 py-3">
                {Math.round(
                  (generalData.sessions || 0) / (fieldData.length || 1),
                )}
              </td>
              <td className="px-6 py-3">
                {Math.round(
                  fieldData.reduce(
                    (acc: number, r) => acc + (r.activeAttendees || 0),
                    0,
                  ) / (fieldData.length || 1),
                )}
              </td>
              <td className="px-6 py-3">
                {Math.round(
                  (generalData.checkins || 0) / (fieldData.length || 1),
                )}
              </td>
              <td className="px-6 py-3"></td>
            </tr>

            {/* Sorted Items */}
            {paginatedData.map((row, index: number) => {
              return (
                <tr
                  key={index}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedGraphItems.includes(
                        row.faculty?._id || row.faculty?.id || "",
                      )}
                      onChange={() =>
                        toggleGraphItem(row.faculty?._id || row.faculty?.id || "")
                      }
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {row.faculty?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3">
                    {Math.floor((row.rate || 0) * 1000) / 10}%
                  </td>
                  <td className="px-6 py-3">{row.courses?.length || 0}</td>
                  <td className="px-6 py-3">{row.sessions || 0}</td>
                  <td className="px-6 py-3">{row.activeAttendees || 0}</td>
                  <td className="px-6 py-3">{row.checkins || 0}</td>
                  <td className="px-6 py-3" />
                </tr>
              );
            })}
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
            Showing {sortedData.length} out of {fieldData.length}
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
