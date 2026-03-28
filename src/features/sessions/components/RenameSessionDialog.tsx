import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Session } from "@/shared/types/session.types";
import { useSessionStore } from "@/features/courses/store/session.store";

interface RenameSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  courseId: string;
}

export function RenameSessionDialog({
  open,
  onOpenChange,
  session,
  courseId,
}: RenameSessionDialogProps) {
  const { t } = useTranslation();
  const [sessionName, setSessionName] = useState("");
  const renameSession = useSessionStore((s) => s.renameSession);

  // Sync state when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevSession, setPrevSession] = useState(session);

  if (open !== prevOpen || session !== prevSession) {
    setPrevOpen(open);
    setPrevSession(session);
    if (open && session) {
      setSessionName(session.name || "");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !courseId || !sessionName.trim()) return;

    try {
      await renameSession(courseId, session.id, sessionName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to rename session", error);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("rename-session - title") || "Rename Session"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("start-session - session name") || "Session Name"}
            </Label>
            <Input
              id="name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="col-span-3"
              maxLength={40}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#333] hover:bg-gray-100"
            >
              {t("general - cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={!sessionName.trim()}>
              {t("general - ok") || "OK"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
