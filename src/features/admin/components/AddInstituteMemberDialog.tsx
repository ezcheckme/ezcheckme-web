/**
 * Add Institute Member Dialog — invite new member to admin group.
 *
 * Source: old AddInstituteMemberDialog.js → simplified.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, UserPlus, Mail } from "lucide-react";
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
import { post } from "@/shared/services/api-client";
import { API_PATHS } from "@/config/constants";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AddInstituteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddInstituteMemberDialog({
  open,
  onOpenChange,
  onAdded,
}: AddInstituteMemberDialogProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function reset() {
    setEmail("");
    setError("");
    setLoading(false);
    setSuccess(false);
  }

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await post(`${API_PATHS.HOST}/admin-group/add-member`, { email });
      setSuccess(true);
      onAdded?.();
    } catch (err) {
      setError("Failed to add member. They may already be in the group.");
    }
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-link" />
            {t("add institute member - title") || "Add Institute Member"}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Mail className="h-10 w-10 text-green-500" />
            <p className="text-sm text-gray-700 text-center">
              Invitation sent to <span className="font-medium">{email}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Enter the email address of the host you want to add to your
              institute group.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="host@university.edu"
                className={error ? "border-red-400" : ""}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-[#333] hover:bg-gray-100"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-link hover:bg-link/90 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" /> Add Member
                  </span>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
