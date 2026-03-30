/**
 * Excel import utility functions
 */

export const COLUMN_DEFINITIONS = [
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

/** A single cell value from the Excel parser — could be string, number, null, etc. */
type CellValue = string | number | boolean | null | undefined;

export interface ValidationResult {
  validRows: string[][];
  error: string | null;
}

/**
 * Validates and normalizes parsed excel data into an array of attendee arrays
 * @param data 2D array representing parsed Excel rows
 * @returns Object containing either the valid rows or an error string
 */
export function validateAttendeeExcelData(
  data: CellValue[][],
): ValidationResult {
  if (!data || data.length < 2) {
    return { validRows: [], error: "No data rows found in the file." };
  }

  const headerRow = data[0].map((c) =>
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
    return {
      validRows: [],
      error: `Missing required columns: ${missingColumns.join(", ")}`,
    };
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
    return {
      validRows: [],
      error:
        "Duplicate column mappings detected. Each required column must be unique.",
    };
  }

  const validRows: string[][] = [];

  // Validate each row
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const normalizedRow: string[] = COLUMN_DEFINITIONS.map((def) => {
      if (def.key === "countryCode" && isCountryCodeMissing) {
        return defaultCountryCode;
      }
      return String(row[colMap[def.key]] ?? "");
    });

    // Avoid fully empty rows at the end of excel files
    if (normalizedRow.every((val) => val === "")) {
      continue;
    }

    // Check missing data
    if (normalizedRow.some((val) => val === "")) {
      return {
        validRows: [],
        error: `Missing data in one or more columns in line ${i + 2}.`,
      };
    }

    const email = normalizedRow[2];
    // RFC-5322 simplified regex
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      return {
        validRows: [],
        error: `Invalid email "${email}" provided in line ${i + 2}.`,
      };
    }

    // Format country code
    normalizedRow[3] = normalizedRow[3].replace(/[^0-9]/g, "");
    if (normalizedRow[3].length < 1) {
      return {
        validRows: [],
        error: `No country code detected in line ${i + 2}.`,
      };
    }

    // Format phone
    normalizedRow[4] = normalizedRow[4].replace(/[^0-9]/g, "");
    if (normalizedRow[4].length < 6) {
      return {
        validRows: [],
        error: `Illegal phone number in line ${i + 2}.`,
      };
    }

    // Validate name
    if (normalizedRow[0].trim().length < 1 || normalizedRow[1].trim().length < 1) {
      return {
        validRows: [],
        error: `Valid first and last name must be provided in line ${i + 2}.`,
      };
    }

    // Valid ID
    if (normalizedRow[5].trim().length < 1) {
      return {
        validRows: [],
        error: `Attendee ID number must be provided in line ${i + 2}.`,
      };
    }

    validRows.push(normalizedRow);
  } // end for loop

  if (validRows.length === 0) {
    return {
      validRows: [],
      error: "No valid rows found to import.",
    };
  }

  return { validRows, error: null };
}
