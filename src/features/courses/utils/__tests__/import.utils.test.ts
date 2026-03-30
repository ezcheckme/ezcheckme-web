import { describe, it, expect } from "vitest";
import { validateAttendeeExcelData } from "../../utils/import.utils";

describe("validateAttendeeExcelData", () => {
  const validHeaders = [
    "First Name",
    "Last Name",
    "Email",
    "Country Code",
    "Phone Number",
    "ID",
  ];

  function makeRow(
    first: string,
    last: string,
    email: string,
    cc: string,
    phone: string,
    id: string,
  ) {
    return [first, last, email, cc, phone, id];
  }

  it("should return error when data is null or has fewer than 2 rows", () => {
    expect(validateAttendeeExcelData(null as any)).toEqual({
      validRows: [],
      error: "No data rows found in the file.",
    });
    expect(validateAttendeeExcelData([])).toEqual({
      validRows: [],
      error: "No data rows found in the file.",
    });
    expect(validateAttendeeExcelData([validHeaders])).toEqual({
      validRows: [],
      error: "No data rows found in the file.",
    });
  });

  it("should return error when required columns are missing", () => {
    const data = [
      ["First Name", "Last Name", "Email"], // missing Phone, Country Code, ID
      ["Alice", "Smith", "alice@test.com"],
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toContain("Missing required columns");
    expect(result.validRows).toEqual([]);
  });

  it("should accept valid data and return parsed rows", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "5551234567", "A001"),
      makeRow("Bob", "Jones", "bob@test.com", "1", "5559876543", "B002"),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toBeNull();
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0][0]).toBe("Alice");
    expect(result.validRows[1][2]).toBe("bob@test.com");
  });

  it("should skip fully empty trailing rows", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "5551234567", "A001"),
      [null, null, null, null, null, null],
      ["", "", "", "", "", ""],
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toBeNull();
    expect(result.validRows).toHaveLength(1);
  });

  it("should return error for rows with missing data", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "", "alice@test.com", "1", "5551234567", "A001"),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toContain("Missing data");
  });

  it("should return error for invalid email", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "not-an-email", "1", "5551234567", "A001"),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toContain("Invalid email");
  });

  it("should return error for phone number shorter than 6 digits", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "123", "A001"),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toContain("Illegal phone number");
  });

  it("should strip non-numeric chars from country code and phone", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "+1", "(555) 123-4567", "A001"),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toBeNull();
    // Country code should be "1", phone should be "5551234567"
    expect(result.validRows[0][3]).toBe("1");
    expect(result.validRows[0][4]).toBe("5551234567");
  });

  it("should return error for missing attendee ID (empty string triggers generic missing-data)", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "5551234567", ""),
    ];
    const result = validateAttendeeExcelData(data);
    // Empty string hits the generic "Missing data" check before the specific ID check
    expect(result.error).toContain("Missing data");
  });

  it("should return error for whitespace-only attendee ID", () => {
    const data = [
      validHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "5551234567", "   "),
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toContain("Attendee ID");
  });

  it("should infer country code as 972 when headers contain Hebrew", () => {
    const headersNoCC = ["שם פרטי", "Last Name", "Email", "Phone Number", "ID"];
    const data = [
      headersNoCC,
      ["אליס", "סמית", "alice@test.com", "5551234567", "A001"],
    ];
    const result = validateAttendeeExcelData(data);
    // Country code column is missing, so it should default to 972 (Hebrew detected)
    expect(result.error).toBeNull();
    expect(result.validRows[0][3]).toBe("972");
  });

  it("should return error for duplicate column mappings", () => {
    const dupeHeaders = [
      "First Name",
      "First Name",
      "Email",
      "Country Code",
      "Phone Number",
      "ID",
    ];
    const data = [
      dupeHeaders,
      makeRow("Alice", "Smith", "alice@test.com", "1", "5551234567", "A001"),
    ];
    const result = validateAttendeeExcelData(data);
    // "Last Name" is missing because both columns map to firstName
    expect(result.error).not.toBeNull();
  });

  it("should return error when all rows are empty", () => {
    const data = [
      validHeaders,
      [null, null, null, null, null, null],
      ["", "", "", "", "", ""],
    ];
    const result = validateAttendeeExcelData(data);
    expect(result.error).toBe("No valid rows found to import.");
  });
});
