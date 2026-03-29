/**
 * Import Grading Excel Dialog — import grades from Excel with attendance matching.
 * Replaces old ImportGradingExcelDialog.js (370 lines).
 *
 * Flow:
 * 1. Upload Excel file
 * 2. Find email column, match to enrolled students, compute attendance
 * 3. Display enriched table preview
 * 4. Download enriched Excel (CSV or XLSX) via ExcelJS
 */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import readXlsxFile from "read-excel-file/browser";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Loader2,
  UploadCloud,
  AlertCircle,
  Download,
  FileSpreadsheet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseStore } from "../store/course.store";
import { useStudentStore } from "../store/student.store";
import { getConfigExcelEmailPossibleTitles } from "@/shared/services/host.service";
import { getDateString } from "@/shared/utils/date.utils";

interface ImportGradingExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName?: string;
}

const NOT_FOUND_VALUE = "-";

// Default email column titles for auto-detection
const DEFAULT_EMAIL_TITLES = ["mail", "מייל", "דוא"];

export function ImportGradingExcelDialog({
  open,
  onOpenChange,
  courseId,
  courseName = "",
}: ImportGradingExcelDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courses = useCourseStore((s) => s.courses);
  const students = useStudentStore((s) => s.students);
  const [sessions, setSessions] = useState<any[]>([]);

  const [showTable, setShowTable] = useState(false);
  const [rows, setRows] = useState<any[][]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentsNotFound, setStudentsNotFound] = useState(0);
  const [emailColumnTitles, setEmailColumnTitles] =
    useState<string[]>(DEFAULT_EMAIL_TITLES);
  const [titlesLoaded, setTitlesLoaded] = useState(false);

  // Resolve course name from store if not provided
  const resolvedCourseName =
    courseName ||
    (courses ?? []).find((c) => c.id === courseId)?.name ||
    "Course";

  // Load configurable email column titles
  useEffect(() => {
    if (open && !titlesLoaded) {
      setTitlesLoaded(true);
      getConfigExcelEmailPossibleTitles()
        .then((config: any) => {
          if (
            config?.status === "success" &&
            config?.result?.excelemailcolumntitles
          ) {
            setEmailColumnTitles([...config.result.excelemailcolumntitles]);
          }
        })
        .catch(() => {
          // use defaults
        });
    }
  }, [open, titlesLoaded]);

  // Load sessions for attendance matching
  useEffect(() => {
    if (open && courseId) {
      import("@/shared/services/session.service").then((mod) => {
        mod
          .getCourseSessions(courseId)
          .then((data: any) => {
            setSessions(Array.isArray(data) ? data : (data?.result ?? []));
          })
          .catch(() => setSessions([]));
      });
    }
  }, [open, courseId]);

  function resetState() {
    setShowTable(false);
    setRows([]);
    setImporting(false);
    setError(null);
    setStudentsNotFound(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  }

  function isMail(text: string): boolean {
    if (!text) return false;
    const lc = text.toLowerCase();
    return emailColumnTitles.some((title) => lc.includes(title));
  }

  function getAttendance(
    email: string,
    emailsNotFoundRef: { count: number },
  ): { appearances: string | number; attendanceRate: string | number } {
    const result = {
      appearances: NOT_FOUND_VALUE as string | number,
      attendanceRate: NOT_FOUND_VALUE as string | number,
    };

    if (!email || !students || !sessions) return result;

    const student = students.find(
      (s: any) =>
        s.email && s.email.toLowerCase() === String(email).toLowerCase(),
    );

    if (!student) {
      emailsNotFoundRef.count++;
      return result;
    }

    let appearances = 0;
    (sessions as any[]).forEach((session: any) => {
      (session.attendees ?? []).forEach((attendee: any) => {
        if (attendee.id === student.id) appearances++;
      });
    });

    const sessionCount = (sessions as any[]).length || 1;
    result.appearances = appearances;
    result.attendanceRate =
      Math.round((1000 * appearances) / sessionCount) / 10;
    return result;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImporting(true);

    try {
      const data = await readXlsxFile(file);
      if (!data || data.length < 1) {
        throw new Error(
          t("import report error - email column not found") ||
            "No data found in the file.",
        );
      }
      processData(data as any[][]);
    } catch (err: any) {
      setError(err.message || "Failed to parse file.");
      setImporting(false);
    }
  }

  function processData(data: any[][]) {
    const headerRow = data[0];
    let emailIndex = -1;

    // Find email column
    headerRow.forEach((col: any, idx: number) => {
      if (isMail(String(col ?? ""))) emailIndex = idx;
    });

    if (emailIndex === -1) {
      setError(
        t("import report error - email column not found") ||
          "Email column not found in the uploaded file.",
      );
      setImporting(false);
      return;
    }

    // Build enriched table
    const emailsNotFoundRef = { count: 0 };
    const enrichedRows: any[][] = [];

    enrichedRows.push([
      ...headerRow,
      "Attendancies",
      "Attendance rate (percentage)",
      "grade",
    ]);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const padded: any[] = [];
      for (let j = 0; j < headerRow.length; j++) {
        padded.push(row[j] ?? "");
      }
      const email = String(row[emailIndex] ?? "");
      const { appearances, attendanceRate } = getAttendance(
        email,
        emailsNotFoundRef,
      );
      enrichedRows.push([...padded, appearances, attendanceRate]);
    }

    setStudentsNotFound(emailsNotFoundRef.count);
    setRows(enrichedRows);
    setImporting(false);
    setShowTable(true);
  }

  async function handleDownload(format: "csv" | "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Course Summary");

    rows.forEach((row, rowIdx) => {
      const excelRow = sheet.getRow(rowIdx + 1);
      excelRow.values = row;

      // Highlight rows where attendee was not found
      if (rowIdx > 0 && row[row.length - 1] === NOT_FOUND_VALUE) {
        row.forEach((_: any, colIdx: number) => {
          const cell = excelRow.getCell(colIdx + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFCC" },
            bgColor: { argb: "FFFFFFCC" },
          };
        });
      }
    });

    // Auto-size columns
    if (rows.length > 0) {
      rows[0].forEach((_: any, colIdx: number) => {
        let maxLen = 10;
        rows.forEach((row) => {
          const len = String(row[colIdx] ?? "").length;
          if (len > maxLen) maxLen = len;
        });
        sheet.getColumn(colIdx + 1).width = Math.min(Math.max(maxLen, 10), 40);
      });
    }

    const fileName = `${resolvedCourseName} with attendance - ${getDateString(new Date())}`;

    if (format === "csv") {
      const buffer = await workbook.csv.writeBuffer();
      saveAs(new Blob([buffer]), `${fileName}.csv`);
    } else {
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${fileName}.xlsx`,
      );
    }

    handleOpenChange(false);
  }

  const matchedCount = rows.length > 1 ? rows.length - 1 - studentsNotFound : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {t("import report - title") || "Import Grading Report"}
            <span className="text-muted-foreground font-normal text-base ml-2">
              {resolvedCourseName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Loading state */}
        {importing && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">Processing file...</p>
          </div>
        )}

        {/* Upload step */}
        {!showTable && !importing && (
          <div className="grid gap-6 py-4">
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-4">
                {t("import report - text") ||
                  "Upload your Excel file with student data. The system will match students by email and calculate attendance rates."}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-link hover:bg-link/90 text-white flex gap-2 h-12 px-6"
              >
                <UploadCloud className="w-5 h-5" />
                {t(
                  "input attendees excel - dialog - select file button text",
                ) || "Select File"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xls,.xlsx"
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Preview table */}
        {showTable && !error && (
          <div className="py-2">
            <div className="border rounded-md overflow-hidden bg-white max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b text-gray-600 sticky top-0">
                  <tr>
                    {rows[0]?.map((h: any, i: number) => (
                      <th
                        key={i}
                        className="px-3 py-2 font-medium whitespace-nowrap"
                      >
                        {String(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(1, 201).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        row[row.length - 1] === NOT_FOUND_VALUE
                          ? "bg-yellow-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      {row.map((cell: any, cIdx: number) => (
                        <td
                          key={cIdx}
                          className="px-3 py-1.5 text-gray-800 truncate max-w-[150px]"
                        >
                          {String(cell ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length > 201 && (
                    <tr>
                      <td
                        colSpan={rows[0]?.length}
                        className="px-3 py-2 text-center text-gray-500 text-xs italic"
                      >
                        ... and {rows.length - 201} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          {!showTable || error ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t("common - cancel") || "Cancel"}
            </Button>
          ) : (
            <>
              <div className="text-sm text-gray-700 mr-auto">
                <span className="font-semibold">{matchedCount}</span> attendees
                matched.{" "}
                <span className="text-amber-600 font-semibold">
                  {studentsNotFound}
                </span>{" "}
                not recognized.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload("csv")}
                  className="flex gap-1"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  onClick={() => handleDownload("excel")}
                  className="bg-link hover:bg-link/90 text-white flex gap-1"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
