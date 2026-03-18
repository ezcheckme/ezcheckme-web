import { useState, useMemo, startTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAdminStore } from "../../store/admin.store";
import { exportBasicTableToExcel } from "@/shared/utils/export.utils";
import { FileSpreadsheet, MoreVertical, UserPlus } from "lucide-react";

export function AttendeesAdminTable() {
  const { t } = useTranslation();
  const { instituteAttendeesStats, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  const attendeesData = (instituteAttendeesStats as any)?.classroomData;
  const data = Array.isArray(attendeesData) ? attendeesData : [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (a: any) =>
        a.name?.toLowerCase().includes(lower) ||
        a.email?.toLowerCase().includes(lower),
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const handleExport = () => {
    if (filteredData.length === 0) return;

    // Prepare data
    const exportData = filteredData.map((a: any, idx: number) => [
      idx + 1,
      a.name || "",
      a.email || "—",
      a.courses || 0,
      a.sessions || 0,
    ]);

    // Header row goes first
    exportData.unshift([
      "#",
      t("Attendee"),
      t("Email"),
      t("Courses"),
      t("Sessions"),
    ]);

    exportBasicTableToExcel({
      fileName: `Attendees_Report_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Attendees",
      data: exportData,
      columnWidths: [10, 30, 40, 15, 15],
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
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-end bg-white">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <input
              type="text"
              placeholder={t("Search")}
              className="w-full pl-3 pr-9 py-2 text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-all bg-transparent"
              value={searchTerm}
              onChange={(e) => {
                startTransition(() => setSearchTerm(e.target.value));
                setPage(0);
              }}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Context Menu equivalent to more_vert */}
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t("Invite a new member")}
              </button>
              <button 
                onClick={handleExport}
                disabled={filteredData.length === 0}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {t("Export")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-gray-500 font-medium">
              <th className="px-6 py-3.5 w-16">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
              </th>
              <th className="px-6 py-3.5">{t("Attendee")}</th>
              <th className="px-6 py-3.5">{t("Email")}</th>
              <th className="px-6 py-3.5">{t("Courses")}</th>
              <th className="px-6 py-3.5">{t("Sessions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {t("No attendees found")}
                </td>
              </tr>
            ) : (
              paginatedData.map((attendee: any, idx: number) => (
                <tr
                  key={attendee.id || idx}
                  className="hover:bg-[#e9e9e9] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {attendee.name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {attendee.email || "—"}
                  </td>
                  <td className="px-6 py-3">
                    {(attendee.courses || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {(attendee.sessions || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            {t("Showing")} {page * rowsPerPage + 1} {t("to")}{" "}
            {Math.min((page + 1) * rowsPerPage, filteredData.length)} {t("of")}{" "}
            {filteredData.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2 text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
