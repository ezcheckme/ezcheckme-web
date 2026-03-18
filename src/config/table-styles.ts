/**
 * Shared table style constants — used by FieldCourseStudents, CourseStudents,
 * CourseSessions, SessionStudents, and other data table components.
 *
 * Module-scope constants avoid re-creation per render.
 */

import { theme } from "@/config/theme";

export const CELL_STYLE: React.CSSProperties = {
  border: "1px grey solid",
  textAlign: "center",
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.normal,
  color: theme.colors.text.primary,
  lineHeight: "20px",
};

export const DATE_CELL_HEADER_STYLE: React.CSSProperties = {
  border: "1px grey solid",
  textAlign: "center",
  padding: 0,
  position: "relative",
  fontSize: theme.font.size.sm,
};

export const FIXED_HEADER_STYLE: React.CSSProperties = {
  ...CELL_STYLE,
  background: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.87)",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
  textAlign: "center",
  padding: `0 ${theme.spacing.md}px`,
};

export const FIXED_CELL_STYLE: React.CSSProperties = {
  ...CELL_STYLE,
  background: "#fafafa",
  padding: `0 ${theme.spacing.sm}px`,
};

export const TABLE_STYLE: React.CSSProperties = {
  borderCollapse: "collapse",
  fontSize: theme.font.size.base,
  width: "100%",
  fontFamily: theme.font.family,
};
