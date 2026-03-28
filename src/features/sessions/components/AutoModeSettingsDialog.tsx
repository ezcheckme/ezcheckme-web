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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoModeStore } from "@/features/auto/store/autoModeStore";

interface AutoModeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoModeSettingsDialog({
  open,
  onOpenChange,
}: AutoModeSettingsDialogProps) {
  const { t } = useTranslation();
  const [sessionDuration, setSessionDuration] = useState("7");
  const { config, setConfig } = useAutoModeStore();
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevConfig, setPrevConfig] = useState(config);

  if (open !== prevOpen || config !== prevConfig) {
    setPrevOpen(open);
    setPrevConfig(config);
    if (open) {
      // In old app, this was stored in localStorage as `_session_registration_length_`
      // We will read from the autoModeStore config, assuming it's synced.
      const storedVal = localStorage.getItem("_session_registration_length_");
      if (storedVal) {
        setSessionDuration(JSON.parse(storedVal).toString());
      } else {
        setSessionDuration(config.registrationDuration?.toString() || "7");
      }
    }
  }

  const handleSave = () => {
    const durationNum = parseInt(sessionDuration, 10);
    localStorage.setItem(
      "_session_registration_length_",
      JSON.stringify(durationNum),
    );
    // Update store
    setConfig({ registrationDuration: durationNum });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("auto mode settings title") || "Session length"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-length">
              {t("Session registration length (minutes)") ||
                "Session registration length (minutes)"}
            </Label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger id="session-length">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="90">90</SelectItem>
                <SelectItem value="120">120</SelectItem>
                <SelectItem value="180">180</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <Button onClick={handleSave}>{t("general - save") || "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
