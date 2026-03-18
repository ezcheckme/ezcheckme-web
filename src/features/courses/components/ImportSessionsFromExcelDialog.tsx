/**
 * ImportSessionsFromExcelDialog
 * Mirrors legacy ImportSessionsFromExcelDialog.js.
 * Multi-step: 1) Instructions + file upload, 2) Preview parsed sessions, 3) Import with progress.
 * Expects Excel with columns: Session Name, Date, Time.
 */

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ParsedSession {
  name: string;
  date: string;
  time: string;
}

interface ImportSessionsFromExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  onImport: (sessions: ParsedSession[]) => Promise<void>;
}

const EXPECTED_COLUMNS = ["Session Name", "Date", "Time"];

export function ImportSessionsFromExcelDialog({
  open,
  onOpenChange,
  courseName,
  onImport,
}: ImportSessionsFromExcelDialogProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sessions, setSessions] = useState<ParsedSession[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      // Dynamic import to keep bundle small
      const { read, utils } = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: unknown[][] = utils.sheet_to_json(ws, { header: 1 });

      if (!rows || rows.length < 2) {
        setError("File must have at least a header row + one data row.");
        return;
      }

      const header = (rows[0] as string[]).map((h) =>
        (h || "").toString().trim().toLowerCase(),
      );
      for (let i = 0; i < EXPECTED_COLUMNS.length; i++) {
        if (header[i] !== EXPECTED_COLUMNS[i].toLowerCase()) {
          setError(
            `Wrong column. Expected "${EXPECTED_COLUMNS[i]}" but got "${rows[0][i] || "(empty)"}"`,
          );
          return;
        }
      }

      const parsed: ParsedSession[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] as unknown[];
        if (!row || row.length < 3) continue;

        let name = String(row[0] || "").substring(0, 20);
        if (name.length < 1) {
          setError(`Error: Illegal session name in line ${r + 1}.`);
          return;
        }

        // Date handling — could be serial number or string
        let dateStr: string;
        if (typeof row[1] === "number") {
          const startDate = new Date("1/1/1900 00:00");
          startDate.setDate(startDate.getDate() + (row[1] as number) - 2);
          dateStr = format(startDate, "EEEE, MMM dd yyyy");
        } else {
          dateStr = format(new Date(row[1] as string), "EEEE, MMM dd yyyy");
        }

        // Time handling
        let timeStr: string;
        if (typeof row[2] === "number") {
          const totalHours = (row[2] as number) * 24;
          const h = Math.floor(totalHours);
          const m = Math.round((totalHours - h) * 60);
          timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        } else {
          timeStr = String(row[2]);
        }

        parsed.push({ name, date: dateStr, time: timeStr });
      }

      setSessions(parsed);
      setShowTable(true);
    } catch (err) {
      setError(
        "Failed to parse Excel file. Make sure it is a valid .xlsx file.",
      );
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setShowTable(false);
    try {
      for (let i = 0; i < sessions.length; i++) {
        setMessage(`Processing session ${i + 1} out of ${sessions.length}`);
        setProgress(((i + 1) / sessions.length) * 100);
      }
      await onImport(sessions);
      onOpenChange(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t("session-actions - import sessions dialog - title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Instructions step */}
          {!showTable && !importing && !error && (
            <div className="space-y-3">
              <p>
                {t("session-actions - import sessions dialog - text 1")}
                <strong className="text-link"> {courseName} </strong>
                {t("session-actions - import sessions dialog - text 2")}
              </p>
              <p>
                To run these sessions, hover over their names and click &quot;
                <strong>Resume Session</strong>&quot;.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Please note:</p>
                <ol className="list-decimal ml-5 space-y-0.5">
                  <li>
                    Sessions with future dates will not be visible in the
                    attendees App, so they will not be counted as absences.
                  </li>
                  <li>
                    After a session has been run, the session time and date will
                    be updated to reflect the actual running time.
                  </li>
                </ol>
              </div>
              <p>
                Upload an Excel file with columns: <strong>Session Name</strong>
                , <strong>Date</strong>, <strong>Time</strong>. Names can be up
                to 20 characters.
              </p>

              <Button
                onClick={() => fileRef.current?.click()}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                ref={fileRef}
                onChange={handleFile}
              />
            </div>
          )}

          {/* Preview table */}
          {showTable && !error && (
            <div className="border rounded-lg overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Session Name</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 text-gray-400">{i + 1}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.date}</td>
                      <td className="p-2">{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Import progress */}
          {importing && (
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600">{message}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-link h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {(!showTable || error) && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {showTable && !error && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Import"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
