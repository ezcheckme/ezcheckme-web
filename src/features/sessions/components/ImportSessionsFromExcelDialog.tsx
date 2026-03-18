/**
 * Import Sessions from Excel Dialog
 * Replaces old ImportSessionsFromExcelDialog.js.
 * Handles reading XLSX files, parsing names, dates, and times to create future sessions.
 */

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import readXlsxFile from "read-excel-file/web";
import { Loader2, UploadCloud, AlertCircle, CalendarRange } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionStore } from "../../courses/store/session.store";

interface ImportSessionsExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName?: string;
  courseDetails?: any;
}

export function ImportSessionsFromExcelDialog({
  open,
  onOpenChange,
  courseId,
  courseName = "this course",
  courseDetails,
}: ImportSessionsExcelDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createSession = useSessionStore((s) => s.createSession);
  const getCourseSessions = useSessionStore((s) => s.getCourseSessions);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const EXPECTED_COLS = ["Session Name", "Date", "Time"];

  function resetState() {
    setLoading(false);
    setError(null);
    setRows([]);
    setShowPreview(false);
    setImporting(false);
    setProgress(0);
    setStatusMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && importing) return;
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const data = await readXlsxFile(file);
      if (!data || data.length < 2) {
        throw new Error("No data rows found in the file.");
      }
      processExcelData(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Invalid or empty file. Please upload a valid Excel file.",
      );
      setLoading(false);
    }
  }

  // Fractional days to time logic from original app
  function fractionalDayToTime(fraction: number) {
    const totalSeconds = Math.round(fraction * 24 * 60 * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function processExcelData(data: any[]) {
    const headerRow = data[0].map((c: any) =>
      String(c || "")
        .trim()
        .toLowerCase(),
    );
    const dataRows = data.slice(1);

    if (headerRow.length < EXPECTED_COLS.length) {
      setError(
        `Expecting ${EXPECTED_COLS.length} columns: "Session Name", "Date", "Time"`,
      );
      setLoading(false);
      return;
    }

    for (let i = 0; i < EXPECTED_COLS.length; i++) {
      if (headerRow[i] !== EXPECTED_COLS[i].toLowerCase()) {
        setError(
          `Wrong column at index ${i}. Expected "${EXPECTED_COLS[i]}" but got "${headerRow[i] || "empty"}"`,
        );
        setLoading(false);
        return;
      }
    }

    const validRows: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = [...dataRows[i]];

      // Avoid fully empty rows at the end of excel files
      if (row.every((val) => val === null || val === undefined || val === "")) {
        continue;
      }

      if (row.length < EXPECTED_COLS.length) {
        setError(`Incomplete data row ${i + 2}`);
        setLoading(false);
        return;
      }

      // Name validation
      if (typeof row[0] === "number") row[0] = row[0].toString();
      if (typeof row[0] !== "string" || String(row[0]).trim().length < 1) {
        setError(`Illegal session name in line ${i + 2}.`);
        setLoading(false);
        return;
      }
      row[0] = row[0].substring(0, 20);

      // Date parsing
      if (typeof row[1] === "number") {
        // Excel date number
        let baseDate = new Date("1/1/1900 00:00:00Z");
        let computedDate = addDays(baseDate, row[1] - 2);
        row[1] = format(computedDate, "EEEE, MMM dd yyyy");
      } else {
        row[1] = new Date(row[1]);
      }

      // Time parsing
      let timeValue = row[2];
      if (typeof timeValue === "string") {
        const timeParts = timeValue.split(":").map(Number);
        if (
          (timeParts.length === 2 || timeParts.length === 3) &&
          !isNaN(timeParts[0]) &&
          !isNaN(timeParts[1])
        ) {
          const hours = timeParts[0];
          const minutes = timeParts[1];
          const seconds = timeParts.length === 3 ? timeParts[2] : 0;
          timeValue = (hours + minutes / 60 + seconds / 3600) / 24;
        } else {
          setError(`Invalid time format in line ${i + 2}.`);
          setLoading(false);
          return;
        }
      } else if (typeof timeValue !== "number") {
        setError(
          `Invalid time type in line ${i + 2}. Expected number or hh:mm`,
        );
        setLoading(false);
        return;
      }

      row[2] = fractionalDayToTime(timeValue as number);
      validRows.push(row);
    }

    if (validRows.length === 0) {
      setError("No valid rows found to import.");
      setLoading(false);
      return;
    }

    setRows(validRows);
    setShowPreview(true);
    setLoading(false);
  }

  async function handleImport() {
    setImporting(true);
    let counter = 0;

    // We assume default registration length of 7 days if not defined
    const regLen = parseInt(
      localStorage.getItem("_session_registration_length_") || "7",
      10,
    );

    for (const session of rows) {
      counter++;
      setStatusMessage(
        `Processing session ${counter} out of ${rows.length}...`,
      );

      const sessionDate = new Date(session[1]);
      const [hours, minutes, seconds] = session[2].split(":").map(Number);
      sessionDate.setHours(hours, minutes, seconds || 0);

      const sessionName = session[0];

      const sessionData = {
        course: courseDetails || { _id: courseId, id: courseId }, // Mocked course obj if missing full details
        courseId: courseId,
        name: sessionName,
        date: sessionDate.getTime(),
        description: "",
        duration: regLen,
        icongroup: "Academy",
        ivrEnabled: courseDetails?.ivrenabled || false,
        iconQuizEnabled: courseDetails?.iconQuizEnabled !== false,
        qrinterval: courseDetails?.qrinterval || 4,
        location: courseDetails?.location || {},
        isFuture: true, // signal that this is a future session
      };

      try {
        await createSession(sessionData);
      } catch (err) {
        console.warn("Failed to create future session", err);
      }

      setProgress(Math.round((counter / rows.length) * 100));
    }

    // Refresh sessions when done
    if (courseId) {
      await getCourseSessions(courseId);
    }

    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("session-actions - import sessions dialog - title") ||
              "Import Sessions From Excel"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">Reading Excel file...</p>
          </div>
        ) : importing ? (
          <div className="flex flex-col py-8 px-4">
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 w-full bg-gray-100" />
          </div>
        ) : !showPreview ? (
          <div className="grid gap-6 py-4">
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-4">
                You are about to import a list of future sessions to{" "}
                <span className="font-semibold text-black">{courseName}</span>.
              </p>

              <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-3 rounded-md mb-4 border border-yellow-200">
                <p className="font-semibold mb-2">Please note:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Sessions with future dates will not be visible in the
                    attendees App, so they will not be counted as absences.
                  </li>
                  <li>
                    After a session has been run, the session time and date will
                    be updated to reflect the actual running time.
                  </li>
                  <li>
                    To run these sessions, hover over their names and click
                    "Resume Session".
                  </li>
                </ol>
              </div>

              <p className="mb-2 mt-6">
                The file must be in Excel format and should contain the
                following columns:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600 font-mono">
                <li>Session Name</li>
                <li>Date</li>
                <li>Time</li>
              </ul>

              <div className="text-xs text-gray-500 mb-6">
                Note: Session names can be up to 20 characters.
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center mt-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-link hover:bg-link/90 text-white flex gap-2 h-12 px-6"
              >
                <UploadCloud className="w-5 h-5" />
                Select File
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
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4 text-link">
              <CalendarRange className="w-5 h-5" />
              <span className="font-medium">
                Found {rows.length} valid sessions to schedule
              </span>
            </div>

            <div className="border rounded-md overflow-hidden bg-white max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600 sticky top-0">
                  <tr>
                    {EXPECTED_COLS.map((h) => (
                      <th key={h} className="px-4 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {row.map((cell: any, cIdx: number) => {
                        let displayVal = cell;
                        if (cell instanceof Date) {
                          displayVal = format(cell, "EEEE, MMM dd yyyy");
                        }
                        return (
                          <td key={cIdx} className="px-4 py-2 text-gray-800">
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {rows.length > 100 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-center text-gray-500 text-xs italic"
                      >
                        ... and {rows.length - 100} more sessions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Please review the upcoming schedule. If everything looks correct,
              click Import.
            </p>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={importing || loading}
            className="text-[#333] hover:bg-gray-100"
          >
            {t("common - cancel") || "Cancel"}
          </Button>
          {showPreview && !importing && (
            <Button
              onClick={handleImport}
              className="bg-link hover:bg-link/90 text-white"
            >
              Import Sessions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
