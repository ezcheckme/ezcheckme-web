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

export interface PostCheckInUrlData {
  message: string;
  url: string;
}

interface PostCheckInUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PostCheckInUrlData | null;
  onSave: (data: PostCheckInUrlData | null) => void;
}

export function PostCheckInUrlDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: PostCheckInUrlDialogProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    if (open) {
      setMessage(initialData?.message || "");
      setUrl(initialData?.url || "");
      setUrlError("");
    }
  }

  const validateUrl = (value: string) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl && !validateUrl(newUrl)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
    } else {
      setUrlError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url) && message) {
      onSave({ message, url });
      onOpenChange(false);
    }
  };

  const handleRemove = () => {
    onSave(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t("post checkin url - title") || "Post Check-in URL"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="text-sm font-semibold text-gray-800 mb-4">
            {t("post checkin url - description") ||
              "Set a URL to redirect attendees to after they check in."}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              {t("post checkin url - message") || "Message"}*
            </Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 60))}
              placeholder="Enter message here..."
              maxLength={60}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/60 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className={urlError ? "border-red-500" : ""}
            />
            {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          </div>

          <DialogFooter className="pt-4 flex sm:justify-between items-center w-full">
            <div>
              {initialData && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleRemove}
                >
                  {t("post checkin url - remove") || "Remove"}
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-[#333] hover:bg-gray-100"
                onClick={() => onOpenChange(false)}
              >
                {t("post checkin url - cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={!!(urlError && url) || !message.trim()}
              >
                {t("post checkin url - save") || "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
