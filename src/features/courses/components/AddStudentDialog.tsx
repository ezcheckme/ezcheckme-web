/**
 * Add Student to Course Dialog — manual entry matching legacy AddStudentToCourseDialog.
 * Uses separate first/last name fields, email, phone (with country code label),
 * and student ID. Legacy had a 2-step flow (search first, then add), but
 * we implement the creation form directly since the search API is not commonly used.
 */

import { useState } from "react";
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

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
}

const ID_TYPES = [
  { value: "zehut", labelKey: "students-actions - add student dialog - teudat zehut" },
  { value: "passport", labelKey: "students-actions - add student dialog - passport" },
  { value: "other", labelKey: "students-actions - add student dialog - other ID" },
];

export function AddStudentDialog({
  open,
  onOpenChange,
  courseId,
}: AddStudentDialogProps) {
  const createStudentManual = useStudentStore((s) => s.createStudentManual);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [idType, setIdType] = useState("zehut");
  const [loading, setLoading] = useState(false);

  const isValid = firstName.trim().length >= 2;

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setStudentId("");
    setIdType("zehut");
    setLoading(false);
  }

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await createStudentManual(courseId, {
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        studentId: studentId.trim() || undefined,
        courseId,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add student:", error);
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-gray-900">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-[1.25rem] font-normal text-[rgba(0,0,0,0.87)] text-center tracking-tight">
            Add Attendee
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col gap-4">
            {/* First Name */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                First Name
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
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1"
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[14px] text-gray-600 shrink-0">
                Email
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
                      {type.value === "zehut" ? "Teudat Zehut" : type.value === "passport" ? "Passport" : "Other ID"}:
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
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
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
             Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="bg-link hover:bg-link/90 text-white text-[13px] uppercase px-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </span>
            ) : (
               "Add"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
