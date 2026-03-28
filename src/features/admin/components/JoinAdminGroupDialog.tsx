import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { removeHostInviteToGroup } from "@/shared/services/group.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface JoinAdminGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinAdminGroupDialog({
  open,
  onOpenChange,
}: JoinAdminGroupDialogProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const getHostData = useAuthStore((s) => s.getHostData);

  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  const groupJoined = (user as Record<string, any>)?.invitationToGroup || {
    groupName: "",
    groupHostName: "",
  };

  const onSubmit = async () => {
    if (!user || !(user as Record<string, any>).invitationToGroup) return;

    setSubmitEnabled(true);
    try {
      await removeHostInviteToGroup(user.id, (user as Record<string, any>).invitationToGroup);
      setInvitationAccepted(true);

      // Refresh user data so the group is updated
      await getHostData();
    } catch (err) {
      console.error("Failed to join group:", err);
    } finally {
      setSubmitEnabled(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen && invitationAccepted) {
      // Reset after closing
      setTimeout(() => setInvitationAccepted(false), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {!invitationAccepted ? (
              t("You have been invited to join an institutional account group!")
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircle2 className="w-6 h-6" />
                <span>{t("Success")}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-slate-700 dark:text-slate-300">
          {!invitationAccepted ? (
            <div className="space-y-4">
              <div>
                <strong>{t("Group name:")}</strong> {groupJoined.groupName}
              </div>
              <div>
                <strong>{t("Group administrator:")}</strong>{" "}
                {groupJoined.groupHostName}
              </div>

              <p className="font-medium mt-4">
                {t(
                  "Joining the group will enable you to use all the premium features that were purchased by your organization.",
                )}
              </p>

              <p className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md">
                <strong>{t("Please note:")}</strong>{" "}
                {t(
                  "The account Admin will have access to your attendance reports.",
                )}
              </p>
            </div>
          ) : (
            <div className="text-lg">
              {t("You are now part of")}{" "}
              <strong className="text-primary">{groupJoined.groupName}</strong>{" "}
              {t("group")}
            </div>
          )}
        </div>

        <DialogFooter>
          {!invitationAccepted ? (
            <>
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={submitEnabled}
              >
                {t(
                  "add institute member - dialog - cancel button text",
                  "Cancel",
                )}
              </Button>
              <Button
                onClick={onSubmit}
                disabled={submitEnabled}
                className="min-w-[150px]"
              >
                {submitEnabled ? t("Joining...") : t("Yes - Join group")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleOpenChange(false)}
              className="min-w-[100px]"
            >
              {t("Done")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
