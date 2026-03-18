/**
 * Course Excel Report Builder.
 * Fetches course export data from the server and builds a multi-sheet Excel
 * workbook client-side using ExcelJS, then triggers a download.
 *
 * Mirrors old app behaviour:
 *   1) GET /export/host/{hostId}/course/{courseId} → JSON payload
 *   2) Build excel with sheets: "Summary", per-session sheets
 *   3) Download as .xlsx
 */

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { exportExcelReport } from "@/shared/services/host.service";
import { getDateString } from "@/shared/utils/date.utils";

// ---------------------------------------------------------------------------
// Types (matching API response shape)
// ---------------------------------------------------------------------------

interface ExportAttendee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  attendeeid: string;
}

interface ExportCheckin {
  attendee_id: string;
  checkin_time?: string;
  method?: string;
}

interface ExportSession {
  _id: string;
  name: string;
  shortId: string;
  date: string;
  label?: string;
  checkins: ExportCheckin[];
}

interface ExportData {
  name: string;
  attendees: ExportAttendee[];
  sessions: ExportSession[];
  host: {
    name: string;
    email: string;
    plan: string;
  };
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4472C4" },
  bgColor: { argb: "FFFFFFFF" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const HEADER_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

const PRESENT_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFC6EFCE" },
  bgColor: { argb: "FFFFFFFF" },
};

const ABSENT_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFC7CE" },
  bgColor: { argb: "FFFFFFFF" },
};

// ---------------------------------------------------------------------------
// Summary Sheet
// ---------------------------------------------------------------------------

function buildSummarySheet(
  workbook: ExcelJS.Workbook,
  data: ExportData,
): void {
  const sheet = workbook.addWorksheet("Summary");

  // Header row
  const headers = [
    "#",
    "Last Name",
    "First Name",
    "Email",
    "Phone",
    "ID",
    "Attendance Rate",
    "Sessions Attended",
    ...data.sessions.map(
      (s) => `${s.name}\n${s.date ? getDateString(new Date(s.date)) : ""}`,
    ),
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = HEADER_FONT;
  headerRow.fill = HEADER_FILL;
  headerRow.border = HEADER_BORDER;
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.height = 45;

  // Column widths
  sheet.getColumn(1).width = 5; // #
  sheet.getColumn(2).width = 14; // Last Name
  sheet.getColumn(3).width = 14; // First Name
  sheet.getColumn(4).width = 25; // Email
  sheet.getColumn(5).width = 16; // Phone
  sheet.getColumn(6).width = 14; // ID
  sheet.getColumn(7).width = 14; // Attendance Rate
  sheet.getColumn(8).width = 14; // Sessions Attended

  for (let i = 0; i < data.sessions.length; i++) {
    sheet.getColumn(9 + i).width = 18;
  }

  // Data rows
  data.attendees.forEach((attendee, idx) => {
    // Count sessions attended
    let attended = 0;
    const sessionStatuses: string[] = [];

    data.sessions.forEach((session) => {
      const checkin = session.checkins?.find(
        (c) => c.attendee_id === attendee._id,
      );
      if (checkin) {
        attended++;
        sessionStatuses.push("✓");
      } else {
        sessionStatuses.push("✗");
      }
    });

    const rate =
      data.sessions.length > 0
        ? Math.round((attended / data.sessions.length) * 100)
        : 0;

    const row = sheet.addRow([
      idx + 1,
      attendee.lastName,
      attendee.firstName,
      attendee.email,
      attendee.phone,
      attendee.attendeeid,
      `${rate}%`,
      `${attended} of ${data.sessions.length}`,
      ...sessionStatuses,
    ]);

    // Color session cells
    for (let i = 0; i < sessionStatuses.length; i++) {
      const cell = row.getCell(9 + i);
      cell.alignment = { horizontal: "center" };
      if (sessionStatuses[i] === "✓") {
        cell.fill = PRESENT_FILL;
      } else {
        cell.fill = ABSENT_FILL;
      }
    }

    // Center rate and sessions columns
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(8).alignment = { horizontal: "center" };
  });

  // Freeze header + first 6 columns
  sheet.views = [{ state: "frozen", xSplit: 6, ySplit: 1 }];
}

// ---------------------------------------------------------------------------
// Per-Session Sheets
// ---------------------------------------------------------------------------

function buildSessionSheet(
  workbook: ExcelJS.Workbook,
  session: ExportSession,
  attendees: ExportAttendee[],
  index: number,
): void {
  // Sheet name must be ≤31 chars and unique
  const sheetName = `${index + 1}. ${session.name}`.slice(0, 31);
  const sheet = workbook.addWorksheet(sheetName);

  const headers = [
    "#",
    "Last Name",
    "First Name",
    "Email",
    "Phone",
    "ID",
    "Status",
    "Check-in Time",
    "Check-in Method",
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = HEADER_FONT;
  headerRow.fill = HEADER_FILL;
  headerRow.border = HEADER_BORDER;
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.height = 30;

  sheet.getColumn(1).width = 5;
  sheet.getColumn(2).width = 14;
  sheet.getColumn(3).width = 14;
  sheet.getColumn(4).width = 25;
  sheet.getColumn(5).width = 16;
  sheet.getColumn(6).width = 14;
  sheet.getColumn(7).width = 12;
  sheet.getColumn(8).width = 18;
  sheet.getColumn(9).width = 16;

  attendees.forEach((attendee, idx) => {
    const checkin = session.checkins?.find(
      (c) => c.attendee_id === attendee._id,
    );
    const status = checkin ? "Present" : "Absent";
    const checkinTime = checkin?.checkin_time
      ? new Date(checkin.checkin_time).toLocaleString()
      : "";
    const method = checkin?.method || "";

    const row = sheet.addRow([
      idx + 1,
      attendee.lastName,
      attendee.firstName,
      attendee.email,
      attendee.phone,
      attendee.attendeeid,
      status,
      checkinTime,
      method,
    ]);

    const statusCell = row.getCell(7);
    statusCell.alignment = { horizontal: "center" };
    statusCell.fill = checkin ? PRESENT_FILL : ABSENT_FILL;
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };
  });

  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function downloadCourseReport(courseId: string): Promise<void> {
  // 1) Fetch data from server
  const response = (await exportExcelReport(courseId)) as ExportData;

  if (!response || !response.attendees) {
    throw new Error("Invalid export data received from server");
  }

  // 2) Build workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EZCheck.me";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Summary sheet
  buildSummarySheet(workbook, response);

  // Per-session sheets
  response.sessions.forEach((session, idx) => {
    buildSessionSheet(workbook, session, response.attendees, idx);
  });

  // 3) Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `EZCheck.me - ${response.name} - Attendance Report - ${getDateString(new Date())}`;
  saveAs(blob, `${fileName}.xlsx`);
}
