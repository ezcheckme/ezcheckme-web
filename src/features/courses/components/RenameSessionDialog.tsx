/**
 * RenameSessionDialog
 * Mirrors legacy RenameSession.js.
 * Simple dialog to rename an existing session.
 */

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

interface RenameSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionName: string;
  onRename: (newName: string) => void;
}

export function RenameSessionDialog({
  open,
  onOpenChange,
  sessionName,
  onRename,
}: RenameSessionDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(sessionName);

  const handleSubmit = () => {
    if (name.length >= 3) {
      onRename(name);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setName(sessionName);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("rename-session - title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>{t("start-session - session name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("general - cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={name.length < 3}>
            {t("general - ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
