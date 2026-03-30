import { useState, useMemo, useEffect, startTransition } from "react";
import type { Student } from "@/shared/types";

export interface UseStudentTableOptions<T extends Student> {
  data: T[];
  sortAlphabetically?: boolean;
  filterByPhoneAndId?: boolean;
}

export function useStudentTable<T extends Student>({
  data,
  sortAlphabetically = false,
  filterByPhoneAndId = false,
}: UseStudentTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const filteredData = useMemo(() => {
    let list = data;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((s) => {
        return (
          s.name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          (filterByPhoneAndId &&
            (s.phone?.toLowerCase().includes(term) ||
              s.attendeeid?.toLowerCase().includes(term)))
        );
      });
    }

    if (sortAlphabetically) {
      list = [...list].sort((a, b) => {
        const aLast = (a.lastName || a.name?.split(" ").pop() || "").toLowerCase();
        const bLast = (b.lastName || b.name?.split(" ").pop() || "").toLowerCase();
        if (aLast !== bLast) return aLast.localeCompare(bLast);
        const aFirst = (a.firstName || a.name?.split(" ").slice(0, -1).join(" ") || "").toLowerCase();
        const bFirst = (b.firstName || b.name?.split(" ").slice(0, -1).join(" ") || "").toLowerCase();
        return aFirst.localeCompare(bFirst);
      });
    }

    return list;
  }, [data, searchTerm, sortAlphabetically, filterByPhoneAndId]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Reset page when search term or underlying array bounds change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, data.length]);

  return {
    searchTerm,
    setSearchTerm: (v: string) => startTransition(() => setSearchTerm(v)),
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filteredData,
    paginatedData,
    totalItems,
    totalPages,
    startItem: totalItems > 0 ? page * rowsPerPage + 1 : 0,
    endItem: Math.min((page + 1) * rowsPerPage, totalItems),
  };
}
