/**
 * Course Details — renders the active tab's content.
 * Replaces CourseDetails.js (237 lines).
 */

import { useEffect } from "react";
import { Outlet, useParams, useLocation } from "@tanstack/react-router";
import { useCourseStore } from "../store/course.store";
import { COURSE_VIEWS, type CourseView } from "@/config/constants";
import { CourseHeader } from "./CourseHeader";

export function CourseDetails() {
  const params: any = useParams({ strict: false });
  const location = useLocation();
  const urlCourseId = params.courseId;
  
  const courseId = useCourseStore((s) => s.courseId);
  const view = useCourseStore((s) => s.view);
  const changeView = useCourseStore((s) => s.changeView);

  useEffect(() => {
    if (urlCourseId && urlCourseId !== courseId) {
      useCourseStore.setState({ courseId: urlCourseId });
    }
  }, [urlCourseId, courseId]);

  // Sync route view to store view
  useEffect(() => {
    const path = location.pathname;
    let newView: CourseView | null = null;
    if (path.includes("/dashboard")) newView = COURSE_VIEWS.DASHBOARD as CourseView;
    else if (path.includes("/sessions")) newView = COURSE_VIEWS.SESSIONS as CourseView;
    else if (path.includes("/attendees")) newView = COURSE_VIEWS.STUDENTS as CourseView;
    else if (path.includes("/messages")) newView = COURSE_VIEWS.MESSAGES as CourseView;
    else if (path.includes("/session/")) newView = COURSE_VIEWS.SESSION_STUDENTS as CourseView;
    else if (path.includes("/student/")) newView = COURSE_VIEWS.STUDENT_SESSIONS as CourseView;

    if (newView && newView !== view) {
      changeView(newView);
    }
  }, [location.pathname, view, changeView]);
  
  if (!urlCourseId && !courseId) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p className="text-sm">Select a course from the list</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CourseHeader />
      <div className="flex-1 overflow-y-auto mx-4 bg-white">
        <Outlet />
      </div>
    </div>
  );
}
