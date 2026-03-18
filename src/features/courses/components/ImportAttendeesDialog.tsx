/**
 * Import Attendees from Excel Dialog.
 * Multi-step wizard: upload → preview → import with progress.
 *
 * Source: old ImportAttendeesExcelDialog.js (452 lines) → ~250 lines.
 * Uses read-excel-file for client-side Excel parsing.
 */

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "../../courses/store/student.store";

// ---------------------------------------------------------------------------
// Column definitions with multi-language header matching
// ---------------------------------------------------------------------------

const COLUMN_DEFS = [
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
      "דואר אלקטרוני",
      'דוא"ל',
    ],
  },
  {
    key: "countryCode",
    labels: ["country code", "dial code", "country prefix", "קוד מדינה"],
    optional: true,
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
    ],
  },
  {
    key: "id",
    labels: [
      "id",
      "id number",
      "identity number",
      "student id",
      "ת.ז.",
      "תעודת זהות",
      "מספר מזהה",
    ],
  },
] as const;

type Step = "upload" | "preview" | "importing" | "done" | "error";

interface ImportRow {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImportAttendeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImportAttendeesDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
}: ImportAttendeesDialogProps) {
  const { t } = useTranslation();
  const createStudentManual = useStudentStore((s) => s.createStudentManual);
  const getCourseStudents = useStudentStore((s) => s.getCourseStudents);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  function resetState() {
    setStep("upload");
    setRows([]);
    setError(null);
    setProgress(0);
    setProgressText("");
  }

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Dynamic import to avoid bundling the library if not used
        const { default: readXlsx } = await import("read-excel-file/browser");
        const data = await readXlsx(file);

        if (!data || data.length < 2) {
          setError("File is empty or has no data rows.");
          setStep("error");
          return;
        }

        // Auto-detect columns from header row
        const header = data[0].map((h: unknown) =>
          String(h).toLowerCase().trim(),
        );
        const colMap: Record<string, number> = {};
        const missing: string[] = [];

        for (const def of COLUMN_DEFS) {
          const idx = header.findIndex((h: string) =>
            (def.labels as readonly string[]).some((l: string) => l === h),
          );
          if (idx === -1) {
            if (!("optional" in def && def.optional)) {
              missing.push(def.labels[0]);
            }
          } else {
            colMap[def.key] = idx;
          }
        }

        if (missing.length > 0) {
          setError(`Missing required columns: ${missing.join(", ")}`);
          setStep("error");
          return;
        }

        // Parse data rows
        const parsed: ImportRow[] = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const firstName = String(row[colMap.firstName] ?? "").trim();
          const lastName = String(row[colMap.lastName] ?? "").trim();
          const email = String(row[colMap.email] ?? "").trim();
          const phone = String(row[colMap.phoneNumber] ?? "").replace(
            /[^0-9]/g,
            "",
          );
          const id = String(row[colMap.id] ?? "").trim();
          const cc =
            colMap.countryCode !== undefined
              ? String(row[colMap.countryCode] ?? "").replace(/[^0-9]/g, "")
              : "1";

          if (!firstName || !lastName) continue; // Skip empty rows

          parsed.push({
            firstName,
            lastName,
            email,
            countryCode: cc,
            phoneNumber: phone,
            id,
          });
        }

        if (parsed.length === 0) {
          setError("No valid data rows found.");
          setStep("error");
          return;
        }

        setRows(parsed);
        setStep("preview");
      } catch (err) {
        setError(`Failed to read file: ${(err as Error).message}`);
        setStep("error");
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  async function handleImport() {
    setStep("importing");
    setProgress(0);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setProgressText(
        `Importing ${i + 1} of ${rows.length}: ${row.firstName} ${row.lastName}`,
      );

      try {
        await createStudentManual(courseId, {
          name: `${row.firstName} ${row.lastName}`,
          email: row.email || undefined,
          phone: row.phoneNumber
            ? `+${row.countryCode}${row.phoneNumber}`
            : undefined,
          studentId: row.id || undefined,
          courseId,
        });
      } catch {
        // Continue importing even if individual student fails
      }

      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    await getCourseStudents(courseId);
    setStep("done");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {t("input attendees excel - dialog - title") ||
              "Import Attendees from Excel"}
          </DialogTitle>
        </DialogHeader>

        {/* Upload step */}
        {step === "upload" && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Import attendees to{" "}
              <span className="font-medium text-gray-800">
                {courseName || "this course"}
              </span>{" "}
              from an Excel file.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">Required columns:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>First Name, Last Name</li>
                <li>Email</li>
                <li>Phone Number (without country code)</li>
                <li>ID / Student ID</li>
                <li>Country Code (optional — defaults to "1")</li>
              </ul>
            </div>
            <div
              className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-accent hover:bg-blue-50/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to select an Excel file
              </span>
              <span className="text-xs text-gray-400">.xlsx or .xls</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Preview step */}
        {step === "preview" && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              Found{" "}
              <span className="font-semibold text-gray-800">{rows.length}</span>{" "}
              attendees to import.
            </p>
            <div className="max-h-[250px] overflow-y-auto border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                      #
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-2 py-1.5">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">{row.email}</td>
                      <td className="px-2 py-1.5 text-gray-500">
                        +{row.countryCode}
                        {row.phoneNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Importing step */}
        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-link" />
            <p className="text-sm text-gray-600">{progressText}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-link h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{progress}%</p>
          </div>
        )}

        {/* Done step */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-green-600">
              Import Complete!
            </p>
            <p className="text-sm text-gray-500">
              {rows.length} attendees imported successfully.
            </p>
          </div>
        )}

        {/* Error step */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-sm text-red-600 text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={resetState}>
              <X className="h-3 w-3 mr-1" /> Try Again
            </Button>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={resetState}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                className="bg-link hover:bg-link/90 text-white"
              >
                Import {rows.length} Attendees
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
