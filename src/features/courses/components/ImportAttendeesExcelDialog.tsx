/**
 * Import Attendees from Excel Dialog
 * Replaces old ImportAttendeesExcelDialog.js (450 lines).
 * Handles reading XLSX files, mapping columns, validating phones/emails,
 * and bulk adding students via student.store.
 */

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import readXlsxFile from "read-excel-file/web";
import {
  Loader2,
  UploadCloud,
  AlertCircle,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStudentStore } from "../store/student.store";

interface ImportAttendeesExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName?: string;
}

const COLUMN_DEFINITIONS = [
  {
    key: "firstName",
    labels: ["first name", "given name", "personal name", "first", "שם פרטי"],
  },
  {
    key: "lastName",
    labels: ["last name", "family name", "surname", "last", "שם משפחה"],
  },
  {
    key: "email",
    labels: [
      "email",
      "mail",
      "e-mail",
      "email address",
      "electronic mail",
      "דואר אלקטרוני",
      'דוא"ל',
    ],
  },
  {
    key: "countryCode",
    labels: ["country code", "dial code", "country prefix", "קוד מדינה"],
  },
  {
    key: "phoneNumber",
    labels: [
      "phone number",
      "mobile",
      "phone",
      "cell phone",
      "telephone",
      "נייד",
      "טלפון נייד",
      "מספר נייד",
    ],
  },
  {
    key: "id",
    labels: [
      "id",
      "id number",
      "identity number",
      "identity card",
      "student id",
      "ת.ז.",
      "תעודת זהות",
      "מספר מזהה",
    ],
  },
];

export function ImportAttendeesExcelDialog({
  open,
  onOpenChange,
  courseId,
  courseName = "this course",
}: ImportAttendeesExcelDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createStudentManual = useStudentStore((s) => s.createStudentManual);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]); // parsed valid rows
  const [showPreview, setShowPreview] = useState(false);

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

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
    if (!isOpen && importing) return; // Prevent closing while importing
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

  function processExcelData(data: any[]) {
    const headerRow = data[0].map((c: any) =>
      String(c || "")
        .trim()
        .toLowerCase(),
    );
    const dataRows = data.slice(1);

    const colMap: Record<string, number> = {};
    const missingColumns: string[] = [];
    let isCountryCodeMissing = false;

    // Detect columns
    COLUMN_DEFINITIONS.forEach((def) => {
      const idx = headerRow.findIndex((h: string) => def.labels.includes(h));
      if (idx === -1) {
        if (def.key === "countryCode") {
          isCountryCodeMissing = true;
        } else {
          missingColumns.push(def.labels[0]);
        }
      } else {
        colMap[def.key] = idx;
      }
    });

    if (missingColumns.length > 0) {
      setError(`Missing required columns: ${missingColumns.join(", ")}`);
      setLoading(false);
      return;
    }

    // Default country extraction heuristic (if missing)
    let defaultCountryCode = "1"; // Default to US
    if (isCountryCodeMissing) {
      const firstNameHeader = String(data[0][colMap["firstName"]]);
      const isHebrew = /[\u0590-\u05FF]/.test(firstNameHeader);
      defaultCountryCode = isHebrew ? "972" : "1";
    }

    // Check duplicate mappings
    const indices = Object.values(colMap);
    if (new Set(indices).size !== indices.length) {
      setError(
        "Duplicate column mappings detected. Each required column must be unique.",
      );
      setLoading(false);
      return;
    }

    const validRows: any[] = [];

    // Validate each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const normalizedRow = COLUMN_DEFINITIONS.map((def) => {
        if (def.key === "countryCode" && isCountryCodeMissing) {
          return defaultCountryCode;
        }
        return row[colMap[def.key]];
      });

      // Avoid fully empty rows at the end of excel files
      if (
        normalizedRow.every(
          (val) => val === null || val === undefined || val === "",
        )
      ) {
        continue;
      }

      // Check missing data
      if (
        normalizedRow.some(
          (val) => val === undefined || val === null || val === "",
        )
      ) {
        setError(`Missing data in one or more columns in line ${i + 2}.`);
        setLoading(false);
        return;
      }

      const email = String(normalizedRow[2]);
      const emailRegex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!emailRegex.test(email)) {
        setError(`Invalid email "${email}" provided in line ${i + 2}.`);
        setLoading(false);
        return;
      }

      // Format country code
      normalizedRow[3] = String(normalizedRow[3] || "").replace(/[^0-9]/g, "");
      if (normalizedRow[3].length < 1) {
        setError(`No country code detected in line ${i + 2}.`);
        setLoading(false);
        return;
      }

      // Format phone
      normalizedRow[4] = String(normalizedRow[4] || "").replace(/[^0-9]/g, "");
      if (normalizedRow[4].length < 6) {
        setError(`Illegal phone number in line ${i + 2}.`);
        setLoading(false);
        return;
      }

      // Validate name
      if (
        String(normalizedRow[0]).trim().length < 1 ||
        String(normalizedRow[1]).trim().length < 1
      ) {
        setError(
          `Valid first and last name must be provided in line ${i + 2}.`,
        );
        setLoading(false);
        return;
      }

      // Valid ID
      if (String(normalizedRow[5]).trim().length < 1) {
        setError(`Attendee ID number must be provided in line ${i + 2}.`);
        setLoading(false);
        return;
      }

      validRows.push(normalizedRow);
    } // end for loop

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

    for (const student of rows) {
      counter++;
      setStatusMessage(
        `Processing attendee ${counter} out of ${rows.length}...`,
      );

      const newStudentData = {
        name: `${student[0]} ${student[1]}`, // Combine first and last name
        email: student[2],
        studentId: String(student[5]),
        phone: `+${student[3]}${String(student[4]).startsWith("0") ? student[4].substring(1) : student[4]}`,
        courseId,
      };

      try {
        await createStudentManual(courseId, newStudentData);
      } catch (err) {
        console.warn("Failed to create student manual", err);
        // The legacy app ignores individual failures and keeps going. We replicate this.
      }

      setProgress(Math.round((counter / rows.length) * 100));
    }

    // Refresh student list when done
    if (courseId) {
      await getCourseStudents(courseId);
    }

    handleOpenChange(false);
  }

  const headLabels = COLUMN_DEFINITIONS.map((def) =>
    def.labels[0].replace(/\b\w/g, (l) => l.toUpperCase()),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("input attendees excel - dialog - title") ||
              "Import Attendees From Excel"}
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
                You are about to import a list of attendees to{" "}
                <span className="font-semibold text-black">{courseName}</span>.
              </p>
              <p className="mb-2">
                The file must be in Excel format (.xlsx or .xls) and should
                contain the following columns:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600">
                <li>
                  <span className="font-semibold text-gray-800">
                    First Name
                  </span>{" "}
                  (or Given Name, First)
                </li>
                <li>
                  <span className="font-semibold text-gray-800">Last Name</span>{" "}
                  (or Family Name, Last)
                </li>
                <li>
                  <span className="font-semibold text-gray-800">Email</span>{" "}
                  (Institution Email address is preferable)
                </li>
                <li>
                  <span className="font-semibold text-gray-800">
                    Country Code
                  </span>{" "}
                  (optional; inferred if missing e.g. "1" for US)
                </li>
                <li>
                  <span className="font-semibold text-gray-800">
                    Phone Number
                  </span>{" "}
                  (without country code)
                </li>
                <li>
                  <span className="font-semibold text-gray-800">ID</span> (The
                  institutional Student identification number)
                </li>
              </ul>

              <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-md flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">
                  Note: The primary attendee identifier is the phone number!
                </span>
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
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4 text-link">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium">
                Found {rows.length} valid attendees to import
              </span>
            </div>

            <div className="border rounded-md overflow-hidden bg-white max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600 sticky top-0">
                  <tr>
                    {headLabels.map((h) => (
                      <th key={h} className="px-4 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {row.map((cell: any, cIdx: number) => (
                        <td
                          key={cIdx}
                          className="px-4 py-2 text-gray-800 truncate max-w-[150px]"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length > 100 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-center text-gray-500 text-xs italic"
                      >
                        ... and {rows.length - 100} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Please review the data above. If everything looks correct, click
              Import to begin adding students.
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
              Start Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
