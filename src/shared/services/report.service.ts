/**
 * Institutional report service.
 * Consolidates the legacy classReportService, fieldReportService,
 * and institutionalReportsService into one typed module.
 *
 * Generates multi-sheet Excel reports with:
 * - Classroom attendance sheet
 * - Field/shifts attendance sheet
 */

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { REPORT_CONFIG as CFG } from "@/config/constants";
import { getDateString } from "@/shared/utils/date.utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AttendeeInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  attendeeid: string;
}

interface CourseStats {
  courseName: string;
  hostName: string[];
  sessionsSize: number;
  attendees: Record<string, number>; // attendeeId → attendance count
}

interface FieldCheckinEntry {
  course_id: string;
  course_name: string;
  duration: number;
  checkins: number;
}

interface InstituteAttendeesStats {
  stats: CourseStats[];
  fieldCheckins: Record<string, FieldCheckinEntry[]>;
}

interface GenerateReportParams {
  attendeesInfo: AttendeeInfo[];
  instituteAttendeesStats: InstituteAttendeesStats;
  classroomAttendeesIds: string[];
  fieldCoursesAttendeesIds: string[];
  user: Record<string, any>;
  from: string | number;
  to: string | number;
  onDoneCreating?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function minutesToTime(minutes: number, suffix = ""): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, "0")}${suffix}`;
}

function formatCells(
  sheet: ExcelJS.Worksheet,
  range: string,
  style: Partial<ExcelJS.Style>,
): void {
  const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
  if (!match) return;

  const startCol = match[1].charCodeAt(0) - 64;
  const startRow = parseInt(match[2]);
  const endCol = match[3].charCodeAt(0) - 64;
  const endRow = parseInt(match[4]);

  for (let r = startRow; r <= endRow; r++) {
    const row = sheet.getRow(r);
    for (let c = startCol; c <= endCol; c++) {
      const cell = row.getCell(c);
      Object.assign(cell, style);
    }
  }
}

// ---------------------------------------------------------------------------
// Classroom Report
// ---------------------------------------------------------------------------

export function generateClassroomData({
  attendeesInfo,
  instituteAttendeesStats,
  classroomAttendeesIds,
}: Pick<
  GenerateReportParams,
  "attendeesInfo" | "instituteAttendeesStats" | "classroomAttendeesIds"
>): string[][] {
  const results: string[][] = [];
  const sessionsResults: (string | null)[][] = [];

  // Header row
  const header = [
    "Last Name",
    "First Name",
    "Email",
    "Phone",
    "ID",
    "General Attendance Rate",
    "Sessions",
  ];
  instituteAttendeesStats.stats.forEach((course) => {
    header.push(
      `${course.courseName.slice(0, CFG.STRING_MAX_LENGTH)} \r\n ${course.hostName[0].slice(0, CFG.STRING_MAX_LENGTH)}`,
    );
  });
  results.push(header);
  sessionsResults.push(new Array(header.length).fill(null));

  let index = 0;
  attendeesInfo.forEach((attendee) => {
    if (!classroomAttendeesIds.includes(attendee._id)) return;

    const row: any[] = [
      attendee.lastName,
      attendee.firstName,
      attendee.email,
      attendee.phone,
      attendee.attendeeid,
      "-",
      "-",
    ];
    const sessRow: (string | null)[] = new Array(7).fill(null);

    let attendeeSessions = 0;
    let totalSessions = 0;

    instituteAttendeesStats.stats.forEach((course) => {
      if (course.attendees[attendee._id] !== undefined) {
        const rate = Math.round(
          (course.attendees[attendee._id] / course.sessionsSize) * 100,
        );
        row.push(rate);
        sessRow.push(
          `(${course.attendees[attendee._id]} of ${course.sessionsSize})`,
        );
        attendeeSessions += course.attendees[attendee._id];
        totalSessions += course.sessionsSize;
      } else {
        row.push(CFG.EMPTY_CELL_VALUE);
        sessRow.push(null);
      }
    });

    // Combine rate with session counts
    for (let k = CFG.ID_COL; k < row.length; k++) {
      if (row[k] !== CFG.EMPTY_CELL_VALUE && sessRow[k]) {
        row[k] = `${row[k]}% ${sessRow[k]}`;
      }
    }

    // Overall
    row[CFG.ATTENDANCE_RATE_COL - 1] =
      totalSessions > 0
        ? `${Math.round((attendeeSessions * 100) / totalSessions)}%`
        : "-";
    row[CFG.ATTENDANCE_SESSIONS_COL - 1] =
      `(${attendeeSessions} of ${totalSessions})`;

    index++;
    results.push(row.map(String));
    sessionsResults.push(sessRow);
  });

  return results;
}

export function createClassroomSheet(
  data: string[][],
  sheet: ExcelJS.Worksheet,
  user?: Record<string, any>,
): void {
  data.forEach((row, idx) => {
    const excelRow = sheet.getRow(idx + 1);
    excelRow.values = row;
    if (idx === 0) {
      excelRow.alignment = { wrapText: true };
      excelRow.font = { bold: true };
      excelRow.height = 52;
    }
  });

  sheet.views = [
    {
      state: "frozen" as const,
      xSplit: CFG.ATTENDANCE_SESSIONS_COL,
      ySplit: 1,
    },
  ];

  sheet.getColumn(CFG.LAST_NAME_COL).width = 12;
  sheet.getColumn(CFG.FIRST_NAME_COL).width = 12;
  sheet.getColumn(CFG.EMAIL_COL).width = 25;
  sheet.getColumn(CFG.PHONE_COL).width = 16;
  sheet.getColumn(CFG.ID_COL).width = 13;
  sheet.getColumn(CFG.ATTENDANCE_RATE_COL).width = 12;
  sheet.getColumn(CFG.ATTENDANCE_SESSIONS_COL).width = 8;

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
    bgColor: { argb: "FFFFFFFF" },
  };
  headerRow.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Data row formatting
  for (let i = 2; i <= data.length; i++) {
    const row = sheet.getRow(i);

    // Mask phone if needed
    if (user && !user?.data?.showPhoneNumber) {
      const cell = row.getCell(CFG.PHONE_COL);
      const val = String(cell.value ?? "");
      cell.value = "******" + val.slice(-4);
    }

    row.getCell(CFG.ATTENDANCE_RATE_COL).alignment = { horizontal: "center" };
    row.getCell(CFG.ATTENDANCE_SESSIONS_COL).alignment = {
      horizontal: "center",
    };
  }

  // Course columns
  for (let i = CFG.ATTENDANCE_SESSIONS_COL; i < data[0].length + 1; i++) {
    const col = sheet.getColumn(i);
    if (i > CFG.ATTENDANCE_SESSIONS_COL) col.width = 20;

    for (let y = 1; y < data.length; y++) {
      const cell = sheet.getRow(y + 1).getCell(i + 1);
      cell.alignment = { horizontal: "center" };
      if (data[y]?.[i]?.includes?.("%")) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF7CFC00" },
          bgColor: { argb: "FFFFFFFF" },
        };
      }
    }
  }

  formatCells(sheet, `F1:G${data.length}`, {
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFCC00" },
      bgColor: { argb: "FFD966FF" },
    },
  });
}

// ---------------------------------------------------------------------------
// Field Report
// ---------------------------------------------------------------------------

export function generateFieldData({
  attendeesInfo,
  instituteAttendeesStats,
}: Pick<
  GenerateReportParams,
  "attendeesInfo" | "instituteAttendeesStats"
>): string[][] {
  const results: string[][] = [];

  // Collect unique courses
  const courseMap = new Map<string, { id: string; name: string }>();
  for (const attendeeId in instituteAttendeesStats.fieldCheckins) {
    instituteAttendeesStats.fieldCheckins[attendeeId].forEach((entry) => {
      if (!courseMap.has(entry.course_id)) {
        courseMap.set(entry.course_id, {
          id: entry.course_id,
          name: entry.course_name,
        });
      }
    });
  }
  const courses = Array.from(courseMap.values());

  // Header
  const header = [
    "Last Name",
    "First Name",
    "Email",
    "Phone",
    "ID",
    "Total Shifts",
    ...courses.map((c) => c.name.slice(0, CFG.STRING_MAX_LENGTH)),
  ];
  results.push(header);

  // Data rows
  for (const attendeeId in instituteAttendeesStats.fieldCheckins) {
    const attendee = attendeesInfo.find((a) => a._id === attendeeId);
    if (!attendee) continue;

    const fieldCheckins = instituteAttendeesStats.fieldCheckins[attendeeId];
    const durations = fieldCheckins.map((c) => c.duration);
    const checkins = fieldCheckins.map((c) => c.checkins);
    const totalCheckins = checkins.reduce((a, b) => a + b, 0);
    const totalDuration = minutesToTime(
      durations.reduce((a, b) => a + b, 0),
      " Hrs",
    );

    const row: string[] = [
      attendee.lastName,
      attendee.firstName,
      attendee.email,
      attendee.phone,
      attendee.attendeeid,
      `${fieldCheckins.length} Courses, ${totalCheckins} Shifts, ${totalDuration}`,
    ];

    courses.forEach((course) => {
      const data = fieldCheckins.find((c) => c.course_id === course.id);
      row.push(
        data
          ? `Shifts: ${data.checkins}\r\n Duration: ${minutesToTime(data.duration)}`
          : " ",
      );
    });

    results.push(row);
  }

  return results;
}

export function createFieldSheet(
  data: string[][],
  sheet: ExcelJS.Worksheet,
): void {
  data.forEach((row, idx) => {
    sheet.getRow(idx + 1).values = row;
  });

  sheet.getColumn(CFG.LAST_NAME_COL).width = 12;
  sheet.getColumn(CFG.FIRST_NAME_COL).width = 12;
  sheet.getColumn(CFG.EMAIL_COL).width = 25;
  sheet.getColumn(CFG.PHONE_COL).width = 16;
  sheet.getColumn(CFG.ID_COL).width = 13;

  // Header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
    bgColor: { argb: "FFFFFFFF" },
  };
  headerRow.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Mask phone, format data rows
  for (let i = 2; i <= data.length; i++) {
    const row = sheet.getRow(i);
    row.alignment = { vertical: "middle" };
    const phoneCell = row.getCell(CFG.PHONE_COL);
    const phoneVal = String(phoneCell.value ?? "");
    phoneCell.value = "******" + phoneVal.slice(-4);
  }

  // Course columns formatting
  for (let i = CFG.TOTAL_SHIFTS_COL; i < data[0].length + 1; i++) {
    const col = sheet.getColumn(i);
    col.width = i === CFG.TOTAL_SHIFTS_COL ? 25 : 20;
    col.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    for (let y = 1; y < data.length; y++) {
      const cell = sheet.getRow(y + 1).getCell(i + 1);
      cell.alignment = { horizontal: "center" };
      if (data[y]?.[i]?.includes?.("ion")) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF7CFC00" },
          bgColor: { argb: "FFFFFFFF" },
        };
      }
    }
  }

  formatCells(sheet, `F1:F${data.length}`, {
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFCC00" },
      bgColor: { argb: "FFD966FF" },
    },
  });

  sheet.views = [
    { state: "frozen" as const, xSplit: CFG.TOTAL_SHIFTS_COL, ySplit: 1 },
  ];
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export function generateInstitutionalReport({
  attendeesInfo,
  instituteAttendeesStats,
  classroomAttendeesIds,
  user,
  from,
  to,
  onDoneCreating,
}: GenerateReportParams): void {
  const classroomData = generateClassroomData({
    attendeesInfo,
    instituteAttendeesStats,
    classroomAttendeesIds,
  });

  const fieldData = generateFieldData({
    attendeesInfo,
    instituteAttendeesStats,
  });

  // Build workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EZCheckme";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties = { ...workbook.properties };

  const classroomSheet = workbook.addWorksheet("Classroom Report");
  const fieldSheet = workbook.addWorksheet("Shifts Report");

  createClassroomSheet(classroomData, classroomSheet, user);
  createFieldSheet(fieldData, fieldSheet);

  onDoneCreating?.();

  const isFaculty = user?.data?.facultyManager;
  const groupName = isFaculty
    ? user?.data?.facultyData?.name
    : user?.data?.groupData?.name;
  const label = isFaculty ? "Faculty" : "Institutional";

  const fileName = `EZCheck.me - ${label} attendance report for ${groupName}, ${getDateString(new Date(from))} to ${getDateString(new Date(to))}`;

  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${fileName}.xlsx`,
    );
  });
}
