/**
 * Courses page — master-detail layout.
 * Replaces Courses.js (44 lines) with the sidebar + content pattern.
 */

import { Outlet } from "@tanstack/react-router";
import { CourseList } from "../components/CourseList";

export function CoursesPage() {
  return (
    <div className="flex h-full">
      <title>My Courses — ezCheckMe</title>
      <CourseList />
      <Outlet />
    </div>
  );
}
