/**
 * SearchInput — MUI underline-style search input with right-side icon.
 * Reusable across FieldCourseStudents, CourseStudents, CourseSessions.
 */

import { Search } from "lucide-react";
import { theme } from "@/config/theme";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  width = 180,
}: SearchInputProps) {
  return (
    <div style={{ position: "relative" }}>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "none",
          borderBottom: `1px solid ${theme.colors.border.input}`,
          outline: "none",
          background: "transparent",
          padding: "4px 28px 4px 0",
          height: 32,
          width,
          fontSize: theme.font.size.base,
          fontFamily: "inherit",
        }}
      />
      <Search
        size={16}
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#757575",
        }}
      />
    </div>
  );
}
