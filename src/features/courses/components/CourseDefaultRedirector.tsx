import { useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useCourseStore } from "../store/course.store";

export function CourseDefaultRedirector() {
  const params: any = useParams({ strict: false });
  const navigate = useNavigate();
  const courses = useCourseStore(s => s.courses);
  
  useEffect(() => {
    if (courses) {
      const course = courses.find(c => c.id === params.courseId);
      if (course?.fieldCheckin) {
        navigate({ to: `/courses/${params.courseId}/attendees`, replace: true });
      } else {
        navigate({ to: `/courses/${params.courseId}/sessions`, replace: true });
      }
    }
  }, [courses, params.courseId, navigate]);
  
  return null;
}
