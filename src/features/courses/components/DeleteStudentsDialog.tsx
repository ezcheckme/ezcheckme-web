/**
 * Delete Students Confirmation Dialog.
 * Shows a list of students to be deleted and confirms the action.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStudentStore } from "../../courses/store/student.store";
import type { Student } from "@/shared/types";

interface DeleteStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  students: Student[];
}

export function DeleteStudentsDialog({
  open,
  onOpenChange,
  courseId,
  students,
}: DeleteStudentsDialogProps) {
  const { t } = useTranslation();
  const deleteStudents = useStudentStore((s) => s.deleteStudents);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteStudents(
        courseId,
        students.map((s) => s.id),
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete students:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            {t("delete-students - title") || "Delete Students"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {students.length === 1
              ? `Are you sure you want to remove "${students[0]?.name}" from this course?`
              : `Are you sure you want to remove ${students.length} students from this course?`}
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {students.length > 1 && (
          <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
            {students.map((s) => (
              <div
                key={s.id}
                className="text-sm text-gray-700 py-1 px-2 border-b border-gray-100 last:border-b-0"
              >
                {s.name}
              </div>
            ))}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("common - cancel") || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              `Delete ${students.length > 1 ? `(${students.length})` : ""}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
