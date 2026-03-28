/**
 * Update User Dialog — edit host profile (name, email, institution).
 * Used from AppToolbar profile dropdown.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store/auth.store";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UpdateUserDialog({
  open,
  onOpenChange,
}: UpdateUserDialogProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevUser, setPrevUser] = useState(user);

  if (open !== prevOpen || user !== prevUser) {
    setPrevOpen(open);
    setPrevUser(user);
    if (open && user) {
      const u = user as unknown as Record<string, unknown>;
      setFirstName((u.firstName as string) || "");
      setLastName((u.lastName as string) || "");
      setEmail(user.email || "");
      setInstitution((u.institution as string) || "");
    }
  }

  async function handleSubmit() {
    if (!firstName.trim()) return;
    setLoading(true);
    try {
      // Use auth store's updateUserData
      const { updateUserData } = useAuthStore.getState();
      await updateUserData({
        firstName,
        lastName,
        institution,
      } as unknown as Partial<import("@/shared/types").UserData>);
      onOpenChange(false);
    } catch {
      // Error handling
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-link" />
            {t("update user - title") || "Edit Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="profile-first">{t("edit user - name") || "First Name"}</Label>
              <Input
                id="profile-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-last">{t("edit user - name") || "Last Name"}</Label>
              <Input
                id="profile-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">{t("edit user - email") || "Email"}</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-[10px] text-gray-400">Email cannot be changed</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-institution">{t("edit user - institution") || "Institution"}</Label>
            <Input
              id="profile-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University, school, or organization"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-[#333] hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("edit user - cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !firstName.trim()}
            className="bg-[#179109] hover:bg-[#14810a] text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("edit user - update") || "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
