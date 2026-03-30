import { renderHook, act } from "@testing-library/react";
import { useStudentTable } from "../useStudentTable";
import type { Student } from "@/shared/types";

const mockStudents: Student[] = [
  { id: "1", name: "Alice Johnson", firstName: "Alice", lastName: "Johnson", email: "alice@example.com", phone: "123", attendeeid: "A1" },
  { id: "2", name: "Charlie Brown", firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", phone: "456", attendeeid: "A2" },
  { id: "3", name: "Bob Smith", firstName: "Bob", lastName: "Smith", email: "bob@example.com", phone: "789", attendeeid: "A3" },
];

describe("useStudentTable", () => {
  it("should initialize with default states", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents })
    );

    expect(result.current.page).toBe(0);
    expect(result.current.rowsPerPage).toBe(25);
    expect(result.current.searchTerm).toBe("");
    expect(result.current.totalItems).toBe(3);
    expect(result.current.paginatedData).toHaveLength(3);
  });

  it("should sort students alphabetically by last name then first name if sortAlphabetically is true", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents, sortAlphabetically: true })
    );

    // Expected order: Brown (Charlie), Johnson (Alice), Smith (Bob)
    expect(result.current.filteredData[0].lastName).toBe("Brown");
    expect(result.current.filteredData[1].lastName).toBe("Johnson");
    expect(result.current.filteredData[2].lastName).toBe("Smith");
  });

  it("should maintain original order if sortAlphabetically is false", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents, sortAlphabetically: false })
    );

    // Expected order: Alice, Charlie, Bob
    expect(result.current.filteredData[0].firstName).toBe("Alice");
    expect(result.current.filteredData[1].firstName).toBe("Charlie");
    expect(result.current.filteredData[2].firstName).toBe("Bob");
  });

  it("should filter students by name/email", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents })
    );

    act(() => {
      result.current.setSearchTerm("alice");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].firstName).toBe("Alice");
  });

  it("should filter students by phone and attendeeid if filterByPhoneAndId is true", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents, filterByPhoneAndId: true })
    );

    act(() => {
      // 456 matches Charlie
      result.current.setSearchTerm("456");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe("Charlie Brown");

    act(() => {
      // A3 matches Bob
      result.current.setSearchTerm("A3");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe("Bob Smith");
  });

  it("should NOT filter students by phone or attendeeid if filterByPhoneAndId is false", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents, filterByPhoneAndId: false })
    );

    act(() => {
      result.current.setSearchTerm("456"); // Phone
    });

    expect(result.current.filteredData).toHaveLength(0);
  });

  it("should reset page to 0 when searchTerm changes", () => {
    const { result } = renderHook(() =>
      useStudentTable({ data: mockStudents })
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setSearchTerm("Bob");
    });

    expect(result.current.page).toBe(0);
  });

  it("should paginate correctly", () => {
    // Generate 30 mock students
    const manyMockStudents = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      name: `Student ${i}`,
    }));

    const { result } = renderHook(() =>
      useStudentTable({ data: manyMockStudents })
    );

    // Default rowsPerPage is 25
    expect(result.current.paginatedData).toHaveLength(25);
    expect(result.current.totalPages).toBe(2);

    act(() => {
      result.current.setPage(1);
    });

    expect(result.current.paginatedData).toHaveLength(5);

    act(() => {
      result.current.setRowsPerPage(10);
      result.current.setPage(2);
    });

    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.startItem).toBe(21);
    expect(result.current.endItem).toBe(30);
  });
});
