import { useParams } from "@tanstack/react-router";
import { useCourseStore } from "../store/course.store";
import { CourseStudents } from "./CourseStudents";
import { FieldCourseStudents } from "./FieldCourseStudents";

export function CourseAttendeesWrapper() {
  const params: any = useParams({ strict: false });
  const courseId = params.courseId;
  const courses = useCourseStore((s) => s.courses);
  const course = courses?.find((c) => c.id === courseId);
  
  if (course?.fieldCheckin) {
    return <FieldCourseStudents />;
  }
  return <CourseStudents />;
}
