/**
 * Edit Student Dialog — edit existing student details.
 * Matches legacy EditStudentDialog.js with separate first/last name,
 * ID type dropdown (Israel), and warning about cross-platform updates.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudentStore } from "../../courses/store/student.store";
import type { Student } from "@/shared/types";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

const ID_TYPES = [
  { value: "zehut", labelKey: "students-actions - add student dialog - teudat zehut" },
  { value: "passport", labelKey: "students-actions - add student dialog - passport" },
  { value: "other", labelKey: "students-actions - add student dialog - other ID" },
];

export function EditStudentDialog({
  open,
  onOpenChange,
  student,
}: EditStudentDialogProps) {
  const { t } = useTranslation();
  const updateAttendee = useStudentStore((s) => s.updateAttendee);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [idType, setIdType] = useState("zehut");
  const [loading, setLoading] = useState(false);

  // Populate form when student changes
  useEffect(() => {
    if (student && open) {
      // Split name into first/last if available
      const parts = (student.name || "").split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(student.email || "");
      setPhone(student.phone || "");
      setStudentId(student.studentId || "");
      setIdType("zehut");
      setLoading(false);
    }
  }, [student, open]);

  const isValid = firstName.trim().length >= 2;

  async function handleSubmit() {
    if (!isValid || !student) return;
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateAttendee({
        id: student.id,
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        studentId: studentId.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update student:", error);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-gray-900">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-[1.25rem] font-normal text-[rgba(0,0,0,0.87)] text-center tracking-tight">
            {t("edit-student - title") || "Update Attendee Data"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-0">
          {/* Warning message like legacy */}
          <div className="bg-[#e3f2fd] border-l-4 border-accent px-3 py-2 mb-4 text-[13px] text-[#01579b]">
            {t("edit-student - warning") ||
              "Please note – updating an attendee details will update its profile across the entire platform, including the attendee's App"}
          </div>

          <div className="flex flex-col gap-4">
            {/* First Name */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                {t("students-actions - add student dialog - first name") || "First Name"}
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1"
                autoFocus
                required
              />
            </div>

            {/* Last Name */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                {t("students-actions - add student dialog - last name") || "Last Name"}
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                {t("students-actions - add student dialog - email") || "Email"}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
            </div>

            {/* ID Type + Student ID */}
            <div className="flex items-center gap-4">
              <div className="w-[120px] shrink-0">
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full text-[13px] text-gray-600 border-none bg-transparent py-1 cursor-pointer focus:outline-none"
                >
                  {ID_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {t(type.labelKey) || type.value}:
                    </option>
                  ))}
                </select>
              </div>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                {t("students-actions - add student dialog - phone number") || "Phone Number"}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-[#333] hover:bg-gray-100 text-[13px] uppercase"
          >
            {t("general - cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="bg-link hover:bg-link/90 text-white text-[13px] uppercase px-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              t("edit-student - save") || "Update"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
