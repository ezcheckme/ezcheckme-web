/**
 * PostCheckInUrlDialog
 * Mirrors legacy PostCheckInUrlDialog.js.
 * Allows hosts to set a message + URL that attendees see after checking in.
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

interface PostCheckInUrlData {
  message: string;
  url: string;
}

interface PostCheckInUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PostCheckInUrlData | null) => void;
  initialData?: PostCheckInUrlData | null;
}

function isValidUrl(value: string): boolean {
  if (value === "") return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function PostCheckInUrlDialog({
  open,
  onClose,
  onSave,
  initialData,
}: PostCheckInUrlDialogProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState(initialData?.message || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [urlError, setUrlError] = useState("");

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setUrlError(
      isValidUrl(value)
        ? ""
        : "Please enter a valid URL (e.g., https://example.com)",
    );
  };

  const handleSave = () => {
    if (isValidUrl(url)) {
      onSave({ message, url });
      onClose();
    }
  };

  const handleRemove = () => {
    onSave(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("post checkin url - title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm font-bold">
            {t("post checkin url - description")}
          </p>

          <div className="space-y-1.5">
            <Label>{t("post checkin url - message")}*</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 60))}
              placeholder="Enter message here..."
              maxLength={60}
              autoFocus
            />
            <p className="text-xs text-gray-400">
              {message.length}/60 characters
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              className={urlError ? "border-red-500" : ""}
            />
            {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {initialData && (
            <Button variant="destructive" onClick={handleRemove}>
              {t("post checkin url - remove")}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {t("post checkin url - cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={(!!urlError && url !== "") || !message}
          >
            {t("post checkin url - save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
