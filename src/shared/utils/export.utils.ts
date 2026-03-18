import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

/**
 * Downloads an ExcelJS workbook.
 *
 * @param fileType "csv" | "xlsx"
 * @param fileName Name of the file (without extension)
 * @param workbook The configured ExcelJS workbook
 */
export async function downloadExcel(
  fileType: "csv" | "xlsx",
  fileName: string,
  workbook: ExcelJS.Workbook,
) {
  workbook.creator = "EZCheckme";
  workbook.created = new Date();
  workbook.modified = new Date();

  if (fileType === "csv") {
    const buffer = await workbook.csv.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.csv`);
  } else {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  }
}

/**
 * Helper to generate a basic styled table export for admin screens.
 */
export async function exportBasicTableToExcel({
  fileName,
  sheetName = "Report",
  data,
  columnWidths,
}: {
  fileName: string;
  sheetName?: string;
  data: any[][];
  columnWidths?: number[];
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  (workbook as any).properties.defaultColWidth = 40;

  // Add rows
  data.forEach((row, index) => {
    const excelRow = sheet.getRow(index + 1);
    excelRow.values = row;
  });

  // Set specific column widths if provided
  if (columnWidths?.length) {
    columnWidths.forEach((w, index) => {
      sheet.getColumn(index + 1).width = w;
    });
  }

  // Style header row (first row)
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" }, // Light gray background
    bgColor: { argb: "FFFFFFFF" },
  };

  await downloadExcel("xlsx", fileName, workbook);
}
